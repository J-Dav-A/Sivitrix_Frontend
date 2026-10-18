import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PedidoService } from './pedido.service';
import { PedidoResponse } from './pedido.model';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    @if (pedido(); as p) {
      <h1>Pedido #{{ p.id }} · {{ p.proveedorNombre }}</h1>
      <p>
        <strong>Fecha:</strong> {{ p.fechaPedido | date: 'dd/MM/yyyy HH:mm' }} ·
        <strong>Estado:</strong> {{ p.estado }}
        @if (p.observaciones) { · <strong>Obs.:</strong> {{ p.observaciones }} }
      </p>

      <table class="tabla mat-elevation-z2">
        <thead>
          <tr><th>Producto</th><th>Pedido</th><th>Recibido</th><th>Pendiente</th><th>Recibir ahora</th></tr>
        </thead>
        <tbody>
          @for (d of p.detalles; track d.id) {
            <tr>
              <td>{{ d.productoCodigo }} · {{ d.productoNombre }}</td>
              <td>{{ d.cantidadSolicitada }}</td>
              <td>{{ d.cantidadRecibida }}</td>
              <td>{{ d.pendiente }}</td>
              <td>
                @if (puedeRecibir(p) && d.pendiente > 0) {
                  <input type="number" min="0" [max]="d.pendiente" [ngModel]="recibir[d.id] || 0"
                         (ngModelChange)="recibir[d.id] = $event" class="entrada" />
                } @else { — }
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="acciones">
        <a mat-button routerLink="/pedidos">Volver</a>
        @if (p.estado === 'REGISTRADO') {
          <button mat-button color="warn" (click)="cancelar(p)">Cancelar pedido</button>
        }
        @if (puedeRecibir(p)) {
          <button mat-raised-button color="primary" (click)="registrarRecepcion(p)">Registrar recepción</button>
        }
      </div>
    }
  `,
  styles: [`
    .tabla { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 0.6rem 0.8rem; text-align: left; border-bottom: 1px solid #eee; }
    .entrada { width: 80px; padding: 4px; }
    .acciones { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `],
})
export class PedidoDetalleComponent {
  private readonly service = inject(PedidoService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly pedido = signal<PedidoResponse | null>(null);
  recibir: Record<number, number> = {};

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.service.obtener(Number(this.route.snapshot.paramMap.get('id'))).subscribe((p) => {
      this.pedido.set(p);
      this.recibir = {};
    });
  }

  puedeRecibir(p: PedidoResponse): boolean {
    return p.estado === 'REGISTRADO' || p.estado === 'RECIBIDO_PARCIAL';
  }

  registrarRecepcion(p: PedidoResponse): void {
    const lineas = Object.entries(this.recibir)
      .map(([detalleId, cantidad]) => ({ detalleId: Number(detalleId), cantidad: Number(cantidad) }))
      .filter((l) => l.cantidad > 0);
    if (lineas.length === 0) {
      this.snackBar.open('Indica la cantidad recibida de al menos un producto', 'Cerrar', { duration: 4000 });
      return;
    }
    this.service.recibir(p.id, lineas).subscribe((actualizado) => {
      this.snackBar.open('Recepción registrada: el inventario fue actualizado', 'Cerrar', { duration: 4000 });
      this.pedido.set(actualizado);
      this.recibir = {};
    });
  }

  cancelar(p: PedidoResponse): void {
    if (!confirm(`¿Cancelar el pedido #${p.id}?`)) {
      return;
    }
    this.service.cancelar(p.id).subscribe((actualizado) => this.pedido.set(actualizado));
  }
}
