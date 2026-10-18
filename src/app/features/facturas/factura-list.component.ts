import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { VentaService } from '../ventas/venta.service';
import { FacturaResponse } from '../ventas/venta.model';

@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule],
  template: `
    <h1>Facturas</h1>

    <table mat-table [dataSource]="facturas()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="numero">
        <th mat-header-cell *matHeaderCellDef>N°</th>
        <td mat-cell *matCellDef="let f">{{ f.numero }}</td>
      </ng-container>
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Emisión</th>
        <td mat-cell *matCellDef="let f">{{ f.fechaEmision | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="cliente">
        <th mat-header-cell *matHeaderCellDef>Cliente</th>
        <td mat-cell *matCellDef="let f">{{ f.cliente.nombre }}</td>
      </ng-container>
      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let f">$ {{ f.total | number: '1.2-2' }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let f"><a mat-button color="primary" [routerLink]="['/facturas', f.id]">Ver</a></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (facturas().length === 0) {
      <p class="vacio">Aún no se han emitido facturas.</p>
    }
  `,
  styles: [`
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
  `],
})
export class FacturaListComponent {
  private readonly service = inject(VentaService);
  readonly facturas = signal<FacturaResponse[]>([]);
  readonly columnas = ['numero', 'fecha', 'cliente', 'total', 'acciones'];

  constructor() {
    this.service.facturas().subscribe((l) => this.facturas.set(l));
  }
}
