import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { PLACEHOLDER_IMAGE } from '../../../core/models/product.models';
import { EmptyStateComponent } from '../../../shared/empty-state.component';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.css']
})
export class CartViewComponent implements OnInit {
  cartService = inject(CartService);

  readonly placeholder = PLACEHOLDER_IMAGE;

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  increaseQty(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1).subscribe({
      error: (err) => alert(err.error?.message || '更新數量失敗，請稍後再試。')
    });
  }

  decreaseQty(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1).subscribe({
      error: (err) => alert(err.error?.message || '更新數量失敗，請稍後再試。')
    });
  }

  removeItem(productId: number): void {
    if (confirm('要把這件商品從購物車移除嗎？')) {
      this.cartService.removeFromCart(productId).subscribe({
        error: (err) => alert(err.error?.message || '移除商品失敗，請稍後再試。')
      });
    }
  }

  clearCart(): void {
    if (confirm('確定要清空整個購物車嗎？')) {
      this.cartService.clearCart().subscribe({
        error: (err) => alert(err.error?.message || '清空購物車失敗，請稍後再試。')
      });
    }
  }
}
