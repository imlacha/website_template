import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const SIDEBAR_KEY = 'admin_sidebar_collapsed';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  /** 側欄收合狀態。記在 localStorage，重新整理後維持使用者的選擇。 */
  collapsed = signal<boolean>(AdminLayoutComponent.initialCollapsed());

  /** 沒有存過偏好時，窄螢幕預設收合；存過就一律尊重使用者的選擇。 */
  private static initialCollapsed(): boolean {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) return stored === '1';
    return window.innerWidth <= 992;
  }

  constructor() {
    effect(() => localStorage.setItem(SIDEBAR_KEY, this.collapsed() ? '1' : '0'));
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
