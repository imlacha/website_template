import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, PLACEHOLDER_IMAGE } from '../../../core/models/product.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { PageHeaderComponent } from '../../../shared/page-header.component';

/** 庫存偏低的門檻，列表與警示標籤共用同一個值 */
const LOW_STOCK_THRESHOLD = 10;

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, PageHeaderComponent
  ],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  readonly placeholder = PLACEHOLDER_IMAGE;
  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);
  keyword = signal<string>('');
  savedMessage = signal<string | null>(null);

  showForm = signal<boolean>(false);
  editingProductId = signal<number | null>(null);
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filteredProducts = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(kw) ||
      (p.categoryName ?? '').toLowerCase().includes(kw)
    );
  });

  /** 表頭的統計摘要，讓管理員一進頁面就知道有沒有東西要補 */
  summary = computed(() => {
    const all = this.products();
    return {
      total: all.length,
      out: all.filter(p => p.stock === 0).length,
      low: all.filter(p => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length
    };
  });

  onAddClick(): void {
    this.editingProductId.set(null);
    this.productForm.reset({ price: 0, stock: 0, categoryId: null });
    this.showForm.set(true);
  }

  onEditClick(product: Product): void {
    if (product.id === undefined) return;
    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl
    });
    this.showForm.set(true);
  }

  onDeleteClick(product: Product): void {
    if (product.id === undefined) return;
    if (!confirm(`確定要刪除「${product.name}」嗎？此動作無法復原。`)) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.flash(`已刪除「${product.name}」`);
        this.loadProducts();
      },
      error: (err) => alert(err.error?.message || '刪除商品失敗，請稍後再試。')
    });
  }

  onCancelForm(): void {
    this.showForm.set(false);
  }

  onSubmitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formVal = this.productForm.value;
    const editId = this.editingProductId();
    const request$ = editId !== null
      ? this.productService.updateProduct(editId, formVal)
      : this.productService.createProduct(formVal);

    request$.subscribe({
      next: () => {
        this.flash(editId !== null ? '商品資料已更新' : '新商品已上架');
        this.showForm.set(false);
        this.loadProducts();
      },
      error: (err) => alert(err.error?.message || '儲存商品失敗，請稍後再試。')
    });
  }

  private flash(message: string): void {
    this.savedMessage.set(message);
    setTimeout(() => this.savedMessage.set(null), 2500);
  }

  invalid(field: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!ctrl && ctrl.touched && ctrl.invalid;
  }
}
