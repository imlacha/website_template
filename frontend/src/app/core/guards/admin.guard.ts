import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow navigation only if logged in and user has administrator role
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
