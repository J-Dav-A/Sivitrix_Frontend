import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../productos/services/producto.service';
import { ProductoResponse } from '../productos/models/producto.model';
import { ProveedorService } from '../proveedores/proveedor.service';
import { ProveedorResponse } from '../proveedores/proveedor.model';
import { PedidoService } from './pedido.service';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <h1>Nuevo pedido a proveedor</h1>

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-form-field appearance="outline" class="completo">
        <mat-label>Proveedor</mat-label>
        <mat-select formControlName="proveedorId">
          @for (p of proveedores(); track p.id) {
            <mat-option [value]="p.id">{{ p.nombreEmpresa }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <h3>Productos a pedir</h3>
      <div formArrayName="detalles">
        @for (linea of detalles.controls; track $index; let i = $index) {
          <div class="linea" [formGroupName]="i">
            <mat-form-field appearance="outline" class="ancho">
              <mat-label>Producto</mat-label>
              <mat-select formControlName="productoId">
                @for (p of productosDisponibles(); track p.id) {
                  <mat-option [value]="p.id">{{ p.codigo }} · {{ p.nombre }} (stock {{ p.stockActual }}, mín. {{ p.stockMinimo }})</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="corto">
              <mat-label>Cantidad</mat-label>
              <input matInput type="number" min="1" formControlName="cantidad" />
            </mat-form-field>
            <button mat-icon-button type="button" color="warn" (click)="quitar(i)" [disabled]="detalles.length === 1" aria-label="Quitar">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        }
      </div>
      <button mat-button type="button" (click)="agregar()"><mat-icon>add</mat-icon> Agregar producto</button>

      <mat-form-field appearance="outline" class="completo">
        <mat-label>Observaciones</mat-label>
        <input matInput formControlName="observaciones" />
      </mat-form-field>

      <div class="acciones">
        <a mat-button routerLink="/pedidos">Cancelar</a>
        <button mat-raised-button color="primary" type="submit" [disabled]="enviando()">Registrar pedido</button>
      </div>
    </form>
  `,
  styles: [`
    form { max-width: 760px; }
    .completo { width: 100%; }
    .linea { display: flex; gap: 0.5rem; align-items: baseline; }
    .ancho { flex: 1; }
    .corto { width: 120px; }
    .acciones { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `],
})
export class PedidoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pedidoService = inject(PedidoService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly proveedores = signal<ProveedorResponse[]>([]);
  readonly productosDisponibles = signal<ProductoResponse[]>([]);
  readonly enviando = signal(false);

  readonly form = this.fb.group({
    proveedorId: this.fb.control<number | null>(null, [Validators.required]),
    observaciones: this.fb.nonNullable.control(''),
    detalles: this.fb.array([this.nuevaLinea()]),
  });

  get detalles(): FormArray {
    return this.form.controls.detalles;
  }

  constructor() {
    this.proveedorService.listar().subscribe((l) => this.proveedores.set(l));
    this.productoService.listar().subscribe((l) => this.productosDisponibles.set(l));
  }

  private nuevaLinea() {
    return this.fb.group({
      productoId: this.fb.control<number | null>(null, [Validators.required]),
      cantidad: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    });
  }

  agregar(): void {
    this.detalles.push(this.nuevaLinea());
  }

  quitar(i: number): void {
    this.detalles.removeAt(i);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const v = this.form.getRawValue();
    this.pedidoService
      .crear({
        proveedorId: v.proveedorId as number,
        observaciones: v.observaciones,
        detalles: v.detalles.map((d) => ({ productoId: d.productoId as number, cantidad: d.cantidad })),
      })
      .subscribe({
        next: (pedido) => {
          this.snackBar.open(`Pedido #${pedido.id} registrado`, 'Cerrar', { duration: 3000 });
          this.router.navigate(['/pedidos', pedido.id]);
        },
        error: () => this.enviando.set(false),
      });
  }
}
