import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_META, ORDER_STATUSES } from '../../../core/models/order.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { PageHeaderComponent } from '../../../shared/page-header.component';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, PageHeaderComponent
  ],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class OrderManagementComponent implements OnInit {
  private orderService = inject(OrderService);

  readonly statusMeta = ORDER_STATUS_META;
  readonly statuses = ORDER_STATUSES;

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  /** null = 顯示全部 */
  filterStatus = signal<OrderStatus | null>(null);
  keyword = signal<string>('');
  /** 剛更新成功的訂單編號，用來給一次視覺回饋 */
  justUpdated = signal<number | null>(null);
  /** 正在送出的訂單編號，送出期間鎖住該列的下拉，避免連點 */
  updatingId = signal<number | null>(null);
  /** 該列的錯誤訊息。用行內提示取代 alert()，訊息才不會被瀏覽器的對話框抑制吃掉 */
  rowError = signal<{ id: number; message: string } | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** 每個狀態頁籤上的數量，讓管理員不用切換就知道哪裡有待辦 */
  counts = computed(() => {
    const all = this.orders();
    const map = {} as Record<OrderStatus, number>;
    for (const s of ORDER_STATUSES) {
      map[s] = all.filter(o => o.status === s).length;
    }
    return map;
  });

  filteredOrders = computed(() => {
    const status = this.filterStatus();
    const kw = this.keyword().trim().toLowerCase();

    return this.orders().filter(o => {
      if (status !== null && o.status !== status) return false;
      if (!kw) return true;
      return String(o.id).includes(kw)
        || o.shippingAddress.toLowerCase().includes(kw)
        || o.items.some(i => i.productName.toLowerCase().includes(kw));
    });
  });

  setFilter(status: OrderStatus | null): void {
    this.filterStatus.set(status);
  }

  /**
   * 選了就直接送出，不再跳 confirm()。
   *
   * 原本用 confirm() 二次確認，但瀏覽器在同一頁連續跳過幾次對話框後會提供
   * 「不要再顯示對話方塊」，一旦使用者勾選，confirm() 會直接回傳 false 且不顯示任何東西，
   * 整個變更狀態的功能就會安靜地失效（實測 nginx 完全收不到 PUT 請求）。
   * 訂單狀態本來就可以改回來，不值得用一個會被瀏覽器關掉的機制去擋。
   */
  updateStatus(order: Order, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as OrderStatus;
    if (status === order.status) return;

    this.rowError.set(null);
    this.updatingId.set(order.id);

    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => (o.id === updated.id ? updated : o)));
        this.updatingId.set(null);
        this.justUpdated.set(updated.id);
        setTimeout(() => this.justUpdated.set(null), 2200);
      },
      error: (err) => {
        // 失敗時要自己把下拉拉回原值，否則畫面會停在一個其實沒生效的狀態
        select.value = order.status;
        this.updatingId.set(null);
        this.rowError.set({
          id: order.id,
          message: err.error?.message || '更新失敗，請稍後再試。'
        });
      }
    });
  }

  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_META[status]?.label ?? status;
  }

  itemCount(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}
