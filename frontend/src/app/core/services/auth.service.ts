import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, JwtResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // 使用 Angular Signals 管理反應式的使用者登入狀態
  currentUser = signal<User | null>(null);

  // 利用 computed 衍生反應式狀態。若要取得是否已登入，可直接呼叫 isLoggedIn()
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => {
    const user = this.currentUser();
    return user ? user.roles.includes('ROLE_ADMIN') : false;
  });

  constructor() {
    // 專案啟動時，自動從 localStorage 加載先前儲存的憑證資訊，保持登入狀態
    const storedUser = localStorage.getItem('user_details');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  login(credentials: any): Observable<JwtResponse> {
    return this.http.post<JwtResponse>('/api/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.token);
        const userDetails: User = {
          id: res.id,
          email: res.email,
          name: res.name,
          roles: res.roles
        };
        localStorage.setItem('user_details', JSON.stringify(userDetails));
        this.currentUser.set(userDetails);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post('/api/auth/register', userData);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_details');
    this.currentUser.set(null);
  }
}
