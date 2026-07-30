import { Component, input } from '@angular/core';

/**
 * 讀取中狀態：轉圈 + 說明文字。
 *
 *   <app-loading-state text="正在讀取訂單⋯⋯" />
 *
 * 樣式本體在 styles/components.css 的 .loading-state / .spinner。
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p class="fade-up">{{ text() }}</p>
    </div>
  `
})
export class LoadingStateComponent {
  text = input<string>('載入中⋯⋯');
}
