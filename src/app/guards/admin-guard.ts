import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const isAdminLoggedIn =
    localStorage.getItem('skillkamao-admin-logged-in');

  if (isAdminLoggedIn === 'true') {
    return true;
  }

  return router.createUrlTree(['/admin-login']);
};