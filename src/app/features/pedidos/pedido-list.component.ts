import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PedidoService } from './pedido.service';
import { PedidoResponse } from './pedido.model';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Pedidos a proveedores</h1>
      <a mat-raised-button color="primary" routerLink="/pedidos/nuevo"><mat-icon>add</mat-icon> Nuevo pedido</a>
    </div>

    <table mat-table [dataSource]="pedidos()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>N°</th>
        <td mat-cell *matCellDef="let p">#{{ p.id }}</td>
      </ng-container>
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let p">{{ p.fechaPedido | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="proveedor">
        <th mat-header-cell *matHeaderCellDef>Proveedor</th>
        <td mat-cell *matCellDef="let p">{{ p.proveedorNombre }}</td>
      </ng-container>
      <ng-container matColumnDef="items">
        <th mat-header-cell *matHeaderCellDef>Productos</th>
        <td mat-cell *matCellDef="let p">{{ p.detalles.length }}</td>
      </ng-container>
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let p">{{ etiqueta(p.estado) }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let p"><a mat-button color="primary" [routerLink]="['/pedidos', p.id]">Ver / recibir</a></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (pedidos().length === 0) {
      <p class="vacio">No hay pedidos registrados todavía.</p>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
  `],
})
export class PedidoListComponent {
  private readonly service = inject(PedidoService);
  readonly pedidos = signal<PedidoResponse[]>([]);
  readonly columnas = ['id', 'fecha', 'proveedor', 'items', 'estado', 'acciones'];

  constructor() {
    this.service.listar().subscribe((lista) => this.pedidos.set(lista));
  }

  etiqueta(estado: string): string {
    const nombres: Record<string, string> = {
      REGISTRADO: 'Registrado',
      RECIBIDO_PARCIAL: 'Recibido parcial',
      RECIBIDO: 'Recibido',
      CANCELADO: 'Cancelado',
    };
    return nombres[estado] ?? estado;
  }
}
