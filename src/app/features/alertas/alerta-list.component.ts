import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { environment } from '../../../environments/environment';
import { AlertaResponse } from './alerta.model';

@Component({
  selector: 'app-alerta-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  template: `
    <div class="page-header">
      <h1>Alertas de stock</h1>
      <mat-slide-toggle [checked]="soloActivas()" (change)="cambiarFiltro($event.checked)">Solo activas</mat-slide-toggle>
    </div>

    <table mat-table [dataSource]="alertas()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="nivel">
        <th mat-header-cell *matHeaderCellDef>Nivel</th>
        <td mat-cell *matCellDef="let a">
          <span class="nivel" [class.critico]="a.nivel === 'CRITICO'">{{ a.nivel === 'CRITICO' ? 'Sin existencias' : 'Stock bajo' }}</span>
        </td>
      </ng-container>
      <ng-container matColumnDef="producto">
        <th mat-header-cell *matHeaderCellDef>Producto</th>
        <td mat-cell *matCellDef="let a">{{ a.productoCodigo }} · {{ a.productoNombre }}</td>
      </ng-container>
      <ng-container matColumnDef="stock">
        <th mat-header-cell *matHeaderCellDef>Stock / mínimo</th>
        <td mat-cell *matCellDef="let a">{{ a.stockActual }} / {{ a.stockMinimo }}</td>
      </ng-container>
      <ng-container matColumnDef="faltante">
        <th mat-header-cell *matHeaderCellDef>Faltan para el mínimo</th>
        <td mat-cell *matCellDef="let a">{{ a.faltante }}</td>
      </ng-container>
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Generada</th>
        <td mat-cell *matCellDef="let a">{{ a.fechaGeneracion | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let a">{{ a.activa ? 'Activa' : 'Resuelta' }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let a">
          <a mat-button color="primary" routerLink="/pedidos/nuevo">Hacer pedido</a>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (!cargando() && alertas().length === 0) {
      <p class="vacio">No hay alertas. Todo el inventario está por encima del mínimo.</p>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
    .nivel { padding: 2px 10px; border-radius: 12px; background: #fff3cd; color: #7a5b00; font-size: 0.85rem; }
    .nivel.critico { background: #ffcdd2; color: #b71c1c; }
  `],
})
export class AlertaListComponent {
  private readonly http = inject(HttpClient);

  readonly alertas = signal<AlertaResponse[]>([]);
  readonly cargando = signal(false);
  readonly soloActivas = signal(true);
  readonly columnas = ['nivel', 'producto', 'stock', 'faltante', 'fecha', 'estado', 'acciones'];

  constructor() {
    this.cargar();
  }

  cambiarFiltro(valor: boolean): void {
    this.soloActivas.set(valor);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    const params = new HttpParams().set('soloActivas', this.soloActivas());
    this.http.get<AlertaResponse[]>(`${environment.apiBaseUrl}/alertas`, { params }).subscribe({
      next: (lista) => {
        this.alertas.set(lista);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
