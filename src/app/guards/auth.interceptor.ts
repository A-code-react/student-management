import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PopupService } from '../services/popup.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const popupService = inject(PopupService);

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned).pipe(
      catchError((error: any) => {
        // If 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('principal');
          popupService.show('Session expired. Please login again.', 'error');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};