import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, PLACEHOLDER_IMAGE } from '../../../core/models/product.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, LoadingStateComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  readonly placeholder = PLACEHOLDER_IMAGE;

  product = signal<Product | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(true);
  addingToCart = signal<boolean>(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.loadProduct(id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  incrementQty(): void {
    const prod = this.product();
    if (prod && this.quantity() < prod.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      alert('請先登入才能加入購物車喔！');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const prod = this.product();
    if (!prod || prod.id === undefined) return;

    this.addingToCart.set(true);
    this.cartService.addToCart(prod.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        alert(`已把 ${this.quantity()} 件「${prod.name}」放進購物車！`);
      },
      error: (err) => {
        this.addingToCart.set(false);
        alert(err.error?.message || '加入購物車失敗，請稍後再試。');
      }
    });
  }
}
