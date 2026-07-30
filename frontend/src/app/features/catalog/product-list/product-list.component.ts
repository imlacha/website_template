import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category, PLACEHOLDER_IMAGE } from '../../../core/models/product.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  readonly placeholder = PLACEHOLDER_IMAGE;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  selectedCategory = signal<number | undefined>(undefined);
  searchKeyword = signal<string>('');
  loading = signal<boolean>(false);
  addingToCartId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.searchKeyword(), this.selectedCategory()).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(categoryId?: number): void {
    this.selectedCategory.set(categoryId);
    this.loadProducts();
  }

  onSearch(): void {
    this.loadProducts();
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation(); // 避免點「加入購物車」時一併跳到商品詳情頁
    if (!this.authService.isLoggedIn()) {
      alert('請先登入才能加入購物車喔！');
      return;
    }

    if (product.id === undefined) return;
    this.addingToCartId.set(product.id);

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.addingToCartId.set(null);
        alert(`已把「${product.name}」放進購物車！`);
      },
      error: (err) => {
        this.addingToCartId.set(null);
        alert(err.error?.message || '加入購物車失敗，請稍後再試。');
      }
    });
  }
}
