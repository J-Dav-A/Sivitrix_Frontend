import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';
import { CATEGORIAS_PRODUCTO } from '../models/producto.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly categorias = CATEGORIAS_PRODUCTO;
  readonly enviando = signal(false);

  // Si la ruta trae :id (/productos/editar/5), estamos editando.
  private readonly productoId = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = !!this.productoId;

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    categoria: ['' as string, [Validators.required]],
    precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    costoAdquisicion: [0, [Validators.required, Validators.min(0.01)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    if (this.esEdicion) {
      this.form.controls.codigo.disable();
      this.cargarProducto(Number(this.productoId));
    }
  }

  private cargarProducto(id: number): void {
    this.productoService.obtener(id).subscribe((producto) => {
      this.form.patchValue({
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precioVenta: producto.precioVenta,
        costoAdquisicion: producto.costoAdquisicion,
        stockMinimo: producto.stockMinimo,
      });
    });
  }

    guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const value = this.form.getRawValue();
    const request = {
      codigo: value.codigo,
      nombre: value.nombre,
      categoria: value.categoria as any,
      precioVenta: value.precioVenta,
      costoAdquisicion: value.costoAdquisicion,
      stockMinimo: value.stockMinimo,
    };

    const operacion = this.esEdicion
      ? this.productoService.actualizar(Number(this.productoId), request)
      : this.productoService.crear(request);

    operacion.subscribe({
      next: () => {
        const mensaje = this.esEdicion ? 'Producto actualizado correctamente' : 'Producto registrado correctamente';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/productos']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        // 409 = codigo duplicado (ver GlobalExceptionHandler en el backend).
        if (error.status === 409) {
          this.form.controls.codigo.setErrors({ duplicado: true });
        }
      },
    });
  }
}