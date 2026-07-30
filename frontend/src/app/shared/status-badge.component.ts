import { Component, computed, input } from '@angular/core';
import { OrderStatus, ORDER_STATUS_META } from '../core/models/order.models';

/** 非訂單狀態（例如庫存）用的語意色調 */
export type BadgeTone = 'ok' | 'warn' | 'ship' | 'bad';

const TONE_CLASS: Record<BadgeTone, string> = {
  ok:   'status-completed',
  warn: 'status-pending',
  ship: 'status-shipped',
  bad:  'status-cancelled'
};

/**
 * 狀態徽章：淺底 + 深字 + 實心圓點。
 *
 * 兩種用法：
 *   <app-status-badge [status]="order.status" />      訂單狀態，自動帶出中文與配色
 *   <app-status-badge tone="bad" label="已售完" />     自訂文字
 *
 * 樣式本體在 styles/components.css 的 .status-badge，這裡只負責挑對顏色與文字。
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="cls()">{{ text() }}</span>`,
  styles: [':host { display: inline-flex; }']
})
export class StatusBadgeComponent {
  status = input<OrderStatus | null>(null);
  tone = input<BadgeTone>('ok');
  label = input<string>('');

  cls = computed(() => {
    const s = this.status();
    return s ? ORDER_STATUS_META[s].cls : TONE_CLASS[this.tone()];
  });

  text = computed(() => {
    const s = this.status();
    return s ? ORDER_STATUS_META[s].label : this.label();
  });
}
