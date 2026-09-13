import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import { Auth } from '../services/auth';


export const authGuard: CanActivateFn = () => {

  const auth = inject(Auth);

  const router = inject(Router);

  const platformId =
    inject(PLATFORM_ID);


  /*
   * Angular SSR/server side te
   * localStorage available nahi hunda.
   *
   * Server nu protected page render
   * karan deo.
   */

  if (!isPlatformBrowser(platformId)) {

    return true;

  }


  /*
   * Browser side actual login check
   */

  if (auth.isLoggedIn()) {

    return true;

  }


  return router.createUrlTree([
    '/login'
  ]);

};