import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.models';
import { PLACEHOLDER_IMAGE } from '../../../core/models/product.models';
import { StatusBadgeComponent } from '../../../shared/status-badge.component';
import { LoadingStateComponent } from '../../../shared/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  readonly placeholder = PLACEHOLDER_IMAGE;

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
