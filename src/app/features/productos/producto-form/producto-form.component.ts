import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';
import { CATEGORIAS_PRODUCTO } from '../models/producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss',
})
export class ProductoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly categorias = CATEGORIAS_PRODUCTO;
  readonly enviando = { value: false };

  // SWR-08/SWR-23: validaciones alineadas con el backend (dos capas de defensa).
  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    categoria: ['' as string, [Validators.required]],
    precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    costoAdquisicion: [0, [Validators.required, Validators.min(0.01)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.value = true;
    const value = this.form.getRawValue();

    this.productoService
      .crear({
        codigo: value.codigo,
        nombre: value.nombre,
        categoria: value.categoria as any,
        precioVenta: value.precioVenta,
        costoAdquisicion: value.costoAdquisicion,
        stockMinimo: value.stockMinimo,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Producto registrado correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/productos']);
        },
        error: () => {
          this.enviando.value = false;
        },
      });
  }
}
