import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CreditoService } from './credito.service';
import { CreditoResponse, EstadoCredito } from './credito.model';

@Component({
  selector: 'app-credito-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div class="page-header">
      <h1>Créditos</h1>
      <mat-form-field appearance="outline" class="filtro">
        <mat-label>Estado</mat-label>
        <mat-select [value]="estado()" (selectionChange)="cambiar($event.value)">
          <mat-option value="">Todos</mat-option>
          <mat-option value="PENDIENTE_AUTORIZACION">Pendientes de autorización</mat-option>
          <mat-option value="APROBADO">Aprobados</mat-option>
          <mat-option value="PAGADO">Pagados</mat-option>
          <mat-option value="RECHAZADO">Rechazados</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="creditos()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="venta">
        <th mat-header-cell *matHeaderCellDef>Venta</th>
        <td mat-cell *matCellDef="let c">{{ c.ventaNumero }}</td>
      </ng-container>
      <ng-container matColumnDef="cliente">
        <th mat-header-cell *matHeaderCellDef>Cliente</th>
        <td mat-cell *matCellDef="let c">{{ c.clienteNombre }}</td>
      </ng-container>
      <ng-container matColumnDef="valor">
        <th mat-header-cell *matHeaderCellDef>Valor</th>
        <td mat-cell *matCellDef="let c">$ {{ c.valorTotal | number: '1.2-2' }} ({{ c.numeroCuotas }} cuotas)</td>
      </ng-container>
      <ng-container matColumnDef="saldo">
        <th mat-header-cell *matHeaderCellDef>Saldo pendiente</th>
        <td mat-cell *matCellDef="let c">{{ c.estado === 'APROBADO' || c.estado === 'PAGADO' ? ('$ ' + (c.saldoPendiente | number: '1.2-2')) : '—' }}</td>
      </ng-container>
      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let c">
          <span class="estado" [class.ok]="c.estado === 'APROBADO' || c.estado === 'PAGADO'" [class.espera]="c.estado === 'PENDIENTE_AUTORIZACION'" [class.mal]="c.estado === 'RECHAZADO'">
            {{ etiqueta(c.estado) }}
          </span>
        </td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let c"><a mat-button color="primary" [routerLink]="['/creditos', c.id]">Ver</a></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (creditos().length === 0) {
      <p class="vacio">No hay créditos para mostrar.</p>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .filtro { width: 260px; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
    .estado { padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; background: #eee; }
    .estado.ok { background: #c8e6c9; color: #1b5e20; }
    .estado.espera { background: #fff3cd; color: #7a5b00; }
    .estado.mal { background: #ffcdd2; color: #b71c1c; }
  `],
})
export class CreditoListComponent {
  private readonly service = inject(CreditoService);
  readonly creditos = signal<CreditoResponse[]>([]);
  readonly estado = signal<EstadoCredito | ''>('PENDIENTE_AUTORIZACION');
  readonly columnas = ['venta', 'cliente', 'valor', 'saldo', 'estado', 'acciones'];

  constructor() {
    this.cargar();
  }

  cambiar(estado: EstadoCredito | ''): void {
    this.estado.set(estado);
    this.cargar();
  }

  private cargar(): void {
    this.service.listar(this.estado()).subscribe((l) => this.creditos.set(l));
  }

  etiqueta(estado: string): string {
    const n: Record<string, string> = {
      PENDIENTE_AUTORIZACION: 'Pendiente',
      APROBADO: 'Aprobado',
      RECHAZADO: 'Rechazado',
      PAGADO: 'Pagado',
    };
    return n[estado] ?? estado;
  }
}
