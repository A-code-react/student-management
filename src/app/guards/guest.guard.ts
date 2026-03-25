import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  const user = localStorage.getItem('principal');

  // If user is logged in, redirect to student list
  if (user) {
    router.navigate(['/list-student']);
    return false;
  }

  // Allow access to login page for non-logged-in users
  return true;
};