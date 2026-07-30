import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(keyword?: string, categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<Product[]>('/api/products', { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories');
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('/api/products', product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`/api/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`/api/products/${id}`);
  }
}
