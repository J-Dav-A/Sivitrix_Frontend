import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../productos/services/producto.service';
import { ProductoResponse } from '../productos/models/producto.model';
import { ProveedorService } from './proveedor.service';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h1>{{ esEdicion ? 'Editar proveedor' : 'Nuevo proveedor' }}</h1>

    <form [formGroup]="form" (ngSubmit)="guardar()" class="formulario">
      <mat-form-field appearance="outline">
        <mat-label>NIT</mat-label>
        <input matInput formControlName="nit" placeholder="900123456-8" />
        @if (form.controls.nit.hasError('pattern') && form.controls.nit.touched) {
          <mat-error>NIT inválido (formato: 900123456 o 900123456-8)</mat-error>
        }
        @if (form.controls.nit.hasError('duplicado')) {
          <mat-error>Ya existe un proveedor con este NIT</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Nombre de la empresa</mat-label>
        <input matInput formControlName="nombreEmpresa" />
        @if (form.controls.nombreEmpresa.invalid && form.controls.nombreEmpresa.touched) {
          <mat-error>El nombre es obligatorio</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Nombre del contacto</mat-label>
        <input matInput formControlName="nombreContacto" />
        @if (form.controls.nombreContacto.invalid && form.controls.nombreContacto.touched) {
          <mat-error>El contacto es obligatorio</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="telefono" placeholder="3112345678" />
        @if (form.controls.telefono.invalid && form.controls.telefono.touched) {
          <mat-error>Teléfono inválido (solo dígitos)</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Correo electrónico</mat-label>
        <input matInput type="email" formControlName="email" />
        @if (form.controls.email.invalid && form.controls.email.touched) {
          <mat-error>Correo electrónico inválido</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Productos que suministra</mat-label>
        <mat-select formControlName="productosIds" multiple>
          @for (p of productos(); track p.id) {
            <mat-option [value]="p.id">{{ p.codigo }} · {{ p.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <div class="acciones">
        <a mat-button routerLink="/proveedores">Cancelar</a>
        <button mat-raised-button color="primary" type="submit" [disabled]="enviando()">
          {{ esEdicion ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .formulario { display: flex; flex-direction: column; max-width: 520px; gap: 0.25rem; }
    .acciones { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `],
})
export class ProveedorFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly enviando = signal(false);
  readonly productos = signal<ProductoResponse[]>([]);

  private readonly proveedorId = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = !!this.proveedorId;

  readonly form = this.fb.nonNullable.group({
    nit: ['', [Validators.required, Validators.pattern(/^\d{7,15}(-\d)?$/)]],
    nombreEmpresa: ['', [Validators.required, Validators.maxLength(150)]],
    nombreContacto: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    productosIds: [[] as number[]],
  });

  constructor() {
    this.productoService.listar().subscribe((lista) => this.productos.set(lista));
    if (this.esEdicion) {
      this.form.controls.nit.disable();
      this.service.obtener(Number(this.proveedorId)).subscribe((p) => {
        this.form.patchValue({
          nit: p.nit,
          nombreEmpresa: p.nombreEmpresa,
          nombreContacto: p.nombreContacto,
          telefono: p.telefono,
          email: p.email,
          productosIds: p.productos.map((x) => x.id),
        });
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const request = this.form.getRawValue();
    const operacion = this.esEdicion
      ? this.service.actualizar(Number(this.proveedorId), request)
      : this.service.crear(request);

    operacion.subscribe({
      next: () => {
        this.snackBar.open(this.esEdicion ? 'Proveedor actualizado' : 'Proveedor registrado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/proveedores']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 409) {
          this.form.controls.nit.setErrors({ duplicado: true });
        }
      },
    });
  }
}
