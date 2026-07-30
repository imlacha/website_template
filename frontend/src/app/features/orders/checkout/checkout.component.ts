import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  private orderService = inject(OrderService);

  checkoutForm: FormGroup = this.fb.group({
    shippingAddress: ['', [Validators.required, Validators.minLength(10)]]
  });

  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.cartService.loadCart();
    // Redirect if cart is empty
    setTimeout(() => {
      if (this.cartService.cart().items.length === 0) {
        this.router.navigate(['/cart']);
      }
    }, 500);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) return;

    this.loading.set(true);
    const address = this.checkoutForm.value.shippingAddress;

    this.orderService.checkout(address).subscribe({
      next: () => {
        this.loading.set(false);
        this.cartService.clearCartState();
        alert('訂單已成功送出，謝謝你！');
        this.router.navigate(['/orders/history']);
      },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || '訂單送出失敗，請稍後再試。');
      }
    });
  }
}
