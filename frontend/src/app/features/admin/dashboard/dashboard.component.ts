import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { DashboardStats } from '../../../core/models/analytics.models';
// 狀態徽章的中文與配色由 <app-status-badge> 負責，這裡只需要狀態值本身
import { Order, OrderStatus, ORDER_STATUSES } from '../../../core/models/order.models';
import { Product } from '../../../core/models/product.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { PageHeaderComponent } from '../../../shared/page-header.component';

/** 折線圖上的一天 */
interface DayPoint {
  label: string;   // 顯示用日期 (M/D)
  revenue: number;
  orders: number;
  x: number;       // 已換算好的 SVG 座標
  y: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  stats = signal<DashboardStats | null>(null);
  orders = signal<Order[]>([]);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  loadError = signal<boolean>(false);

  /** 趨勢圖要看幾天，使用者可切換 */
  rangeDays = signal<7 | 14 | 30>(14);
  /** 折線圖游標停在第幾個資料點 */
  hoverIndex = signal<number | null>(null);

  // --- 折線圖版面常數（viewBox 座標）---
  readonly W = 760;
  readonly H = 250;
  readonly padL = 60;
  readonly padR = 18;
  readonly padT = 16;
  readonly padB = 34;
  get plotW() { return this.W - this.padL - this.padR; }
  get plotH() { return this.H - this.padT - this.padB; }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.loadError.set(false);

    // 三支既有 API 一次取回，儀表板其餘指標全部在前端衍生，不需要新的後端端點
    forkJoin({
      stats: this.analyticsService.getDashboardStats(),
      orders: this.orderService.getAllOrders(),
      products: this.productService.getProducts()
    }).subscribe({
      next: ({ stats, orders, products }) => {
        this.stats.set(stats);
        this.orders.set(orders);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  /** 取消的訂單不列入營收與績效統計 */
  private activeOrders = computed(() =>
    this.orders().filter(o => o.status !== OrderStatus.CANCELLED)
  );

  // ---------- KPI ----------

  pendingCount = computed(() =>
    this.orders().filter(o => o.status === OrderStatus.PENDING).length
  );

  avgOrderValue = computed(() => {
    const active = this.activeOrders();
    if (active.length === 0) return 0;
    return active.reduce((sum, o) => sum + o.totalAmount, 0) / active.length;
  });

  /** 本區間營收與前一段等長區間相比的變化率，給 KPI 卡的漲跌標記用 */
  revenueDelta = computed(() => {
    const days = this.rangeDays();
    const now = this.startOfDay(new Date());
    const curFrom = new Date(now); curFrom.setDate(curFrom.getDate() - (days - 1));
    const prevFrom = new Date(curFrom); prevFrom.setDate(prevFrom.getDate() - days);

    let cur = 0, prev = 0;
    for (const o of this.activeOrders()) {
      const d = this.startOfDay(new Date(o.createdAt));
      if (d >= curFrom) cur += o.totalAmount;
      else if (d >= prevFrom) prev += o.totalAmount;
    }
    if (prev === 0) return cur > 0 ? null : 0;  // 沒有比較基準就不顯示百分比
    return ((cur - prev) / prev) * 100;
  });

  // ---------- 營收趨勢折線圖 ----------

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** 依日期把訂單彙總成連續的每日序列（沒有訂單的日子補 0，折線才不會跳格）*/
  trend = computed<DayPoint[]>(() => {
    const days = this.rangeDays();
    const today = this.startOfDay(new Date());

    const buckets = new Map<number, { revenue: number; orders: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.getTime(), { revenue: 0, orders: 0 });
    }

    for (const o of this.activeOrders()) {
      const key = this.startOfDay(new Date(o.createdAt)).getTime();
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += o.totalAmount;
        bucket.orders += 1;
      }
    }

    const entries = [...buckets.entries()];
    const max = this.trendMax(entries.map(([, v]) => v.revenue));
    const step = entries.length > 1 ? this.plotW / (entries.length - 1) : 0;

    return entries.map(([time, v], i) => {
      const d = new Date(time);
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        revenue: v.revenue,
        orders: v.orders,
        x: this.padL + i * step,
        y: this.padT + this.plotH - (v.revenue / max) * this.plotH
      };
    });
  });

  /** 座標軸上限：取整成漂亮的刻度，全為 0 時給 1 避免除以零 */
  private trendMax(values: number[]): number {
    const peak = Math.max(...values, 0);
    if (peak <= 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(peak)));
    return Math.ceil(peak / magnitude) * magnitude;
  }

  trendAxisMax = computed(() => this.trendMax(this.trend().map(p => p.revenue)));

  /** 四條水平格線對應的刻度值與 y 座標 */
  yTicks = computed(() => {
    const max = this.trendAxisMax();
    return [0, 0.25, 0.5, 0.75, 1].map(f => ({
      value: max * f,
      y: this.padT + this.plotH - f * this.plotH
    }));
  });

  trendLine = computed(() => this.trend().map(p => `${p.x},${p.y}`).join(' '));

  /** 折線下方的填色區塊，頭尾拉到基線收口 */
  trendArea = computed(() => {
    const pts = this.trend();
    if (pts.length === 0) return '';
    const base = this.padT + this.plotH;
    const line = pts.map(p => `L${p.x},${p.y}`).join(' ');
    return `M${pts[0].x},${base} ${line} L${pts[pts.length - 1].x},${base} Z`;
  });

  /** x 軸只標示部分日期，避免標籤擠成一團 */
  xTickEvery = computed(() => Math.ceil(this.trend().length / 7));

  hoveredPoint = computed(() => {
    const i = this.hoverIndex();
    return i === null ? null : this.trend()[i] ?? null;
  });

  /** 游標熱區寬度：整個資料點所屬的直向區帶都能觸發 */
  bandWidth = computed(() => {
    const n = this.trend().length;
    return n > 1 ? this.plotW / (n - 1) : this.plotW;
  });

  trendTotal = computed(() => this.trend().reduce((s, p) => s + p.revenue, 0));

  setRange(days: 7 | 14 | 30): void {
    this.rangeDays.set(days);
    this.hoverIndex.set(null);
  }

  // ---------- 訂單狀態分布 ----------

  statusBreakdown = computed(() => {
    const all = this.orders();
    return ORDER_STATUSES.map(status => {
      const count = all.filter(o => o.status === status).length;
      return { status, count, pct: all.length ? (count / all.length) * 100 : 0 };
    });
  });

  // ---------- 熱門商品：點擊 vs 售出 ----------

  topProducts = computed(() => (this.stats()?.topProducts ?? []).slice(0, 6));

  /** 兩個數列都是「次數」，共用同一條刻度，不做雙軸 */
  perfMax = computed(() =>
    Math.max(...this.topProducts().flatMap(p => [p.clicks, p.purchases]), 1)
  );

  barPct(value: number): number {
    return (value / this.perfMax()) * 100;
  }

  // ---------- 需要注意的庫存 ----------

  lowStock = computed(() =>
    this.products()
      .filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6)
  );

  recentOrders = computed(() => this.orders().slice(0, 6));

  // ---------- 格式化 ----------

  money(value: number): string {
    return 'NT$ ' + value.toLocaleString('zh-TW', { maximumFractionDigits: 0 });
  }

  /** 座標軸用的短格式，避免長數字把左邊界撐開 */
  compact(value: number): string {
    if (value >= 10000) return (value / 10000).toFixed(value % 10000 === 0 ? 0 : 1) + '萬';
    if (value >= 1000) return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
    return String(Math.round(value));
  }
}
