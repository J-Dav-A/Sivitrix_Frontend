import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VentaService } from './venta.service';
import { VentaResponse } from './venta.model';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Ventas</h1>
      <a mat-raised-button color="primary" routerLink="/ventas/nueva"><mat-icon>add</mat-icon> Nueva venta</a>
    </div>

    <table mat-table [dataSource]="ventas()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="numero">
        <th mat-header-cell *matHeaderCellDef>N°</th>
        <td mat-cell *matCellDef="let v">{{ v.numero }}</td>
      </ng-container>
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let v">{{ v.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="cliente">
        <th mat-header-cell *matHeaderCellDef>Cliente</th>
        <td mat-cell *matCellDef="let v">{{ v.clienteNombre }}</td>
      </ng-container>
      <ng-container matColumnDef="pago">
        <th mat-header-cell *matHeaderCellDef>Pago</th>
        <td mat-cell *matCellDef="let v">{{ v.tipoPago === 'CONTADO' ? 'Contado' : 'Crédito' }}</td>
      </ng-container>
      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let v">$ {{ v.total | number: '1.2-2' }}</td>
      </ng-container>
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let v">
          <span class="estado" [class.ok]="v.estado === 'CONFIRMADA'" [class.espera]="v.estado === 'PENDIENTE_AUTORIZACION'" [class.mal]="v.estado === 'RECHAZADA' || v.estado === 'CANCELADA'">
            {{ etiqueta(v.estado) }}
          </span>
        </td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let v">
          @if (v.facturaId) {
            <a mat-button color="primary" [routerLink]="['/facturas', v.facturaId]">Factura</a>
          }
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (ventas().length === 0) {
      <p class="vacio">No hay ventas registradas todavía.</p>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
    .estado { padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; background: #eee; }
    .estado.ok { background: #c8e6c9; color: #1b5e20; }
    .estado.espera { background: #fff3cd; color: #7a5b00; }
    .estado.mal { background: #ffcdd2; color: #b71c1c; }
  `],
})
export class VentaListComponent {
  private readonly service = inject(VentaService);
  readonly ventas = signal<VentaResponse[]>([]);
  readonly columnas = ['numero', 'fecha', 'cliente', 'pago', 'total', 'estado', 'acciones'];

  constructor() {
    this.service.listar().subscribe((l) => this.ventas.set(l));
  }

  etiqueta(estado: string): string {
    const n: Record<string, string> = {
      PENDIENTE_AUTORIZACION: 'Pendiente de autorización',
      CONFIRMADA: 'Confirmada',
      RECHAZADA: 'Rechazada',
      CANCELADA: 'Cancelada',
    };
    return n[estado] ?? estado;
  }
}
