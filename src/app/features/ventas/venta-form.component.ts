import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../clientes/services/cliente.service';
import { ClienteResponse } from '../clientes/models/cliente.model';
import { ProductoService } from '../productos/services/producto.service';
import { ProductoResponse } from '../productos/models/producto.model';
import { TASA_IVA, redondearArriba } from '../../core/utils/dinero';
import { VentaService } from './venta.service';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <h1>Nueva venta</h1>

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <div class="fila">
        <mat-form-field appearance="outline" class="ancho">
          <mat-label>Cliente empresarial</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of clientes(); track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} · NIT {{ c.nit }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Forma de pago</mat-label>
          <mat-select formControlName="tipoPago">
            <mat-option value="CONTADO">Contado</mat-option>
            <mat-option value="CREDITO">Crédito</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.controls.tipoPago.value === 'CREDITO') {
          <mat-form-field appearance="outline" class="corto">
            <mat-label>N° de cuotas</mat-label>
            <input matInput type="number" min="1" max="36" formControlName="numeroCuotas" />
          </mat-form-field>
        }
      </div>

      @if (clienteSeleccionado(); as c) {
        @if (form.controls.tipoPago.value === 'CREDITO') {
          <p class="info">Cupo disponible de {{ c.nombre }}: <strong>$ {{ c.cupoDisponible | number: '1.2-2' }}</strong></p>
        }
      }

      <h3>Productos</h3>
      <div formArrayName="detalles">
        @for (linea of detalles.controls; track $index; let i = $index) {
          <div class="linea" [formGroupName]="i">
            <mat-form-field appearance="outline" class="ancho">
              <mat-label>Producto</mat-label>
              <mat-select formControlName="productoId">
                @for (p of productos(); track p.id) {
                  <mat-option [value]="p.id" [disabled]="p.stockActual === 0">
                    {{ p.codigo }} · {{ p.nombre }} — $ {{ p.precioVenta | number: '1.2-2' }} (stock {{ p.stockActual }})
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="corto">
              <mat-label>Cantidad</mat-label>
              <input matInput type="number" min="1" formControlName="cantidad" />
            </mat-form-field>
            <span class="subtotal">$ {{ subtotalLinea(i) | number: '1.2-2' }}</span>
            <button mat-icon-button type="button" color="warn" (click)="quitar(i)" [disabled]="detalles.length === 1" aria-label="Quitar">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        }
      </div>
      <button mat-button type="button" (click)="agregar()"><mat-icon>add</mat-icon> Agregar producto</button>

      <div class="totales mat-elevation-z2">
        <div><span>Subtotal</span><strong>$ {{ totales().subtotal | number: '1.2-2' }}</strong></div>
        <div><span>IVA (19 %)</span><strong>$ {{ totales().iva | number: '1.2-2' }}</strong></div>
        <div class="total"><span>Total</span><strong>$ {{ totales().total | number: '1.2-2' }}</strong></div>
      </div>

      <div class="acciones">
        <a mat-button routerLink="/ventas">Cancelar</a>
        <button mat-raised-button color="primary" type="submit" [disabled]="enviando()">
          {{ form.controls.tipoPago.value === 'CREDITO' ? 'Solicitar crédito' : 'Registrar venta' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    form { max-width: 860px; }
    .fila { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .linea { display: flex; gap: 0.5rem; align-items: baseline; }
    .ancho { flex: 1 1 300px; }
    .corto { width: 120px; }
    .subtotal { width: 130px; text-align: right; font-weight: 500; }
    .info { color: #455a64; }
    .totales { margin-top: 1rem; padding: 1rem; max-width: 320px; margin-left: auto; background: #fafafa; }
    .totales div { display: flex; justify-content: space-between; padding: 2px 0; }
    .totales .total { border-top: 1px solid #ccc; margin-top: 4px; padding-top: 6px; font-size: 1.15rem; }
    .acciones { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `],
})
export class VentaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly productos = signal<ProductoResponse[]>([]);
  readonly enviando = signal(false);

  readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, [Validators.required]),
    tipoPago: this.fb.nonNullable.control<'CONTADO' | 'CREDITO'>('CONTADO'),
    numeroCuotas: this.fb.control<number | null>(null),
    detalles: this.fb.array([this.nuevaLinea()]),
  });

  get detalles(): FormArray {
    return this.form.controls.detalles;
  }

  // El formulario no es un signal; lo convertimos para que totales y cupo se recalculen solos.
  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly clienteSeleccionado = computed(() => {
    const id = this.valores().clienteId;
    return this.clientes().find((c) => c.id === id) ?? null;
  });

  readonly totales = computed(() => {
    const lineas = this.valores().detalles ?? [];
    let subtotal = 0;
    for (const l of lineas) {
      const p = this.productos().find((x) => x.id === l?.productoId);
      if (p && l?.cantidad) {
        subtotal += redondearArriba(p.precioVenta * l.cantidad);
      }
    }
    subtotal = redondearArriba(subtotal);
    const iva = redondearArriba(subtotal * TASA_IVA);
    return { subtotal, iva, total: redondearArriba(subtotal + iva) };
  });

  constructor() {
    this.clienteService.listar().subscribe((l) => this.clientes.set(l));
    this.productoService.listar().subscribe((l) => this.productos.set(l));
  }

  private nuevaLinea() {
    return this.fb.group({
      productoId: this.fb.control<number | null>(null, [Validators.required]),
      cantidad: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    });
  }

  subtotalLinea(i: number): number {
    const l = this.valores().detalles?.[i];
    const p = this.productos().find((x) => x.id === l?.productoId);
    return p && l?.cantidad ? redondearArriba(p.precioVenta * l.cantidad) : 0;
  }

  agregar(): void {
    this.detalles.push(this.nuevaLinea());
  }

  quitar(i: number): void {
    this.detalles.removeAt(i);
  }

  guardar(): void {
    const v = this.form.getRawValue();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (v.tipoPago === 'CREDITO' && !v.numeroCuotas) {
      this.snackBar.open('Indica el número de cuotas para la venta a crédito', 'Cerrar', { duration: 4000 });
      return;
    }

    this.enviando.set(true);
    this.ventaService
      .registrar({
        clienteId: v.clienteId as number,
        tipoPago: v.tipoPago,
        numeroCuotas: v.tipoPago === 'CREDITO' ? v.numeroCuotas : null,
        detalles: v.detalles.map((d) => ({ productoId: d.productoId as number, cantidad: d.cantidad })),
      })
      .subscribe({
        next: (venta) => {
          const msg =
            venta.estado === 'CONFIRMADA'
              ? `Venta ${venta.numero} registrada y facturada`
              : `Venta ${venta.numero} enviada a autorización de crédito`;
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
          this.router.navigate([venta.facturaId ? '/facturas/' + venta.facturaId : '/ventas']);
        },
        error: () => this.enviando.set(false),
      });
  }
}
