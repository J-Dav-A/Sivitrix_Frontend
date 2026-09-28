import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error.model';

/**
 * Intercepta cualquier error HTTP de la API (validaciones, duplicados,
 * recursos no encontrados, etc.) y muestra el mensaje que ya viene
 * formateado desde GlobalExceptionHandler en el backend.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiError | undefined;

      let mensaje = 'Ocurrio un error inesperado. Intenta de nuevo.';
      if (apiError?.detalles?.length) {
        mensaje = apiError.detalles.join(' | ');
      } else if (apiError?.message) {
        mensaje = apiError.message;
      }

      snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      return throwError(() => error);
    }),
  );
};
