import { Component, input } from '@angular/core';

/**
 * 空狀態：說明文字 + 可選的行動按鈕。
 *
 *   <app-empty-state text="購物車還空空的">
 *     <a routerLink="/" class="btn-primary">開始逛商品</a>
 *   </app-empty-state>
 *
 * boxed=true 會套上卡片外框（購物車、訂單那種整頁空畫面用）。
 * 樣式本體在 styles/components.css 的 .empty-state。
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state" [class.boxed]="boxed()">
      <ng-content select="[icon]"></ng-content>
      <p class="fade-up">{{ text() }}</p>
      <div class="empty-action"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    .empty-action:empty { display: none; }
    .empty-action { margin-top: 18px; }
  `]
})
export class EmptyStateComponent {
  text = input<string>('目前沒有資料');
  boxed = input<boolean>(false);
}
