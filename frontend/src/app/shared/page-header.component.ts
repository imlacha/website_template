import { Component, input } from '@angular/core';

/**
 * 頁首：標題 + 副標 + 右側動作區。後台三個頁面共用。
 *
 *   <app-page-header title="訂單管理" subtitle="處理出貨進度">
 *     <button class="btn-outline">重新整理</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="page-header-text">
        <h2 class="slide-in">{{ title() }}</h2>
        @if (subtitle()) {
          <p class="page-subtitle fade-up">{{ subtitle() }}</p>
        }
        <ng-content select="[subtitle]"></ng-content>
      </div>
      <div class="page-header-actions"><ng-content></ng-content></div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }
    .page-header h2 { font-size: 22px; }
    .page-subtitle {
      color: var(--ink-soft);
      font-size: 14px;
      font-weight: 600;
      margin-top: 3px;
    }
    .page-header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  `]
})
export class PageHeaderComponent {
  title = input<string>('');
  subtitle = input<string>('');
}
