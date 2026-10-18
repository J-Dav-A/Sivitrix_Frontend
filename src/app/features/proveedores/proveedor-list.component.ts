import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProveedorService } from './proveedor.service';
import { ProveedorResponse } from './proveedor.model';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Proveedores</h1>
      <a mat-raised-button color="primary" routerLink="/proveedores/nuevo">
        <mat-icon>add</mat-icon>
        Nuevo proveedor
      </a>
    </div>

    <table mat-table [dataSource]="proveedores()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="nit">
        <th mat-header-cell *matHeaderCellDef>NIT</th>
        <td mat-cell *matCellDef="let p">{{ p.nit }}</td>
      </ng-container>
      <ng-container matColumnDef="empresa">
        <th mat-header-cell *matHeaderCellDef>Empresa</th>
        <td mat-cell *matCellDef="let p">{{ p.nombreEmpresa }}</td>
      </ng-container>
      <ng-container matColumnDef="contacto">
        <th mat-header-cell *matHeaderCellDef>Contacto</th>
        <td mat-cell *matCellDef="let p">{{ p.nombreContacto }} · {{ p.telefono }}</td>
      </ng-container>
      <ng-container matColumnDef="productos">
        <th mat-header-cell *matHeaderCellDef>Productos que suministra</th>
        <td mat-cell *matCellDef="let p">{{ p.productos.length }}</td>
      </ng-container>
      <ng-container matColumnDef="ultimoPedido">
        <th mat-header-cell *matHeaderCellDef>Último pedido</th>
        <td mat-cell *matCellDef="let p">{{ p.fechaUltimoPedido ? (p.fechaUltimoPedido | date: 'dd/MM/yyyy') : '—' }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let p">
          <a mat-icon-button [routerLink]="['/proveedores/editar', p.id]" aria-label="Editar"><mat-icon>edit</mat-icon></a>
          <button mat-icon-button color="warn" (click)="eliminar(p)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (!cargando() && proveedores().length === 0) {
      <p class="vacio">No hay proveedores registrados todavía.</p>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
  `],
})
export class ProveedorListComponent {
  private readonly service = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);

  readonly proveedores = signal<ProveedorResponse[]>([]);
  readonly cargando = signal(false);
  readonly columnas = ['nit', 'empresa', 'contacto', 'productos', 'ultimoPedido', 'acciones'];

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (lista) => {
        this.proveedores.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  eliminar(p: ProveedorResponse): void {
    if (!confirm(`¿Eliminar el proveedor "${p.nombreEmpresa}"?`)) {
      return;
    }
    this.service.eliminar(p.id).subscribe(() => {
      this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }
}
