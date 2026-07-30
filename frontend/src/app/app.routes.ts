import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { ProductListComponent } from './features/catalog/product-list/product-list.component';
import { ProductDetailComponent } from './features/catalog/product-detail/product-detail.component';

import { CartViewComponent } from './features/cart/cart-view/cart-view.component';

import { CheckoutComponent } from './features/orders/checkout/checkout.component';
import { OrderHistoryComponent } from './features/orders/order-history/order-history.component';

import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ProductManagementComponent } from './features/admin/product-management/product-management.component';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // 1. Auth Routing (Login/Register)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  // 2. Admin Routing (Analytics & Inventory Control)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductManagementComponent },
      { path: 'orders', component: OrderManagementComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. User & Public Routing (Catalog, Details, Cart, Checkout)
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartViewComponent, canActivate: [authGuard] },
      { path: 'orders/checkout', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'orders/history', component: OrderHistoryComponent, canActivate: [authGuard] }
    ]
  },

  // 4. Wildcard redirect to Home
  { path: '**', redirectTo: '' }
];
