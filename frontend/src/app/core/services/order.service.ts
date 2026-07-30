import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  checkout(shippingAddress: string): Observable<Order> {
    return this.http.post<Order>('/api/orders/checkout', { shippingAddress });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }

  // Admin APIs
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders/all');
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`/api/orders/${id}/status`, null, {
      params: { status }
    });
  }
}
