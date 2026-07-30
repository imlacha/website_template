import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart } from '../models/cart.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // 使用 Angular Signals 維護購物車的反應式狀態
  cart = signal<Cart>({ items: [], totalAmount: 0 });

  // 反應式計算購物車中的商品總件數，導覽列上的 Badge 會直接與此數據連動
  cartItemsCount = computed(() => 
    this.cart().items.reduce((sum, item) => sum + item.quantity, 0)
  );

  constructor() {
    // 專案啟動時，若使用者已經是登入狀態，即自動從後端 API 同步購物車內容
    if (this.authService.isLoggedIn()) {
      this.loadCart();
    }
  }

  loadCart(): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.http.get<Cart>('/api/cart').subscribe({
      next: (cartData) => this.cart.set(cartData),
      error: () => this.cart.set({ items: [], totalAmount: 0 })
    });
  }

  addToCart(productId: number, quantity: number = 1): Observable<void> {
    return this.http.post<void>(`/api/cart/add`, null, {
      params: { productId: productId.toString(), quantity: quantity.toString() }
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`/api/cart/update`, null, {
      params: { productId: productId.toString(), quantity: quantity.toString() }
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`/api/cart/remove`, {
      params: { productId: productId.toString() }
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCartState(): void {
    this.cart.set({ items: [], totalAmount: 0 });
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`/api/cart/clear`).pipe(
      tap(() => this.clearCartState())
    );
  }
}
