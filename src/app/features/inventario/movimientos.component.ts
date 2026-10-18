import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { ProductoService } from '../productos/services/producto.service';
import { ProductoResponse } from '../productos/models/producto.model';
import { MovimientoResponse } from './inventario.model';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h1>Movimientos de inventario</h1>

    <form [formGroup]="form" (ngSubmit)="registrar()" class="fila">
      <mat-form-field appearance="outline" class="ancho">
        <mat-label>Producto</mat-label>
        <mat-select formControlName="productoId">
          @for (p of productos(); track p.id) {
            <mat-option [value]="p.id">{{ p.codigo }} · {{ p.nombre }} (stock {{ p.stockActual }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Tipo</mat-label>
        <mat-select formControlName="tipo">
          <mat-option value="ENTRADA">Entrada</mat-option>
          <mat-option value="SALIDA">Salida</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="corto">
        <mat-label>Cantidad</mat-label>
        <input matInput type="number" min="1" formControlName="cantidad" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="ancho">
        <mat-label>Observación</mat-label>
        <input matInput formControlName="observacion" placeholder="Ajuste de inventario, devolución, merma..." />
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || enviando()">Registrar</button>
    </form>

    <mat-form-field appearance="outline" class="filtro">
      <mat-label>Filtrar por producto</mat-label>
      <mat-select [value]="filtro()" (selectionChange)="filtrar($event.value)">
        <mat-option [value]="null">Todos</mat-option>
        @for (p of productos(); track p.id) {
          <mat-option [value]="p.id">{{ p.codigo }} · {{ p.nombre }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <table mat-table [dataSource]="movimientos()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let m">{{ m.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="producto">
        <th mat-header-cell *matHeaderCellDef>Producto</th>
        <td mat-cell *matCellDef="let m">{{ m.productoCodigo }} · {{ m.productoNombre }}</td>
      </ng-container>
      <ng-container matColumnDef="tipo">
        <th mat-header-cell *matHeaderCellDef>Tipo</th>
        <td mat-cell *matCellDef="let m">
          <span [class.entrada]="m.tipo === 'ENTRADA'" [class.salida]="m.tipo === 'SALIDA'">
            {{ m.tipo === 'ENTRADA' ? '+' : '−' }}{{ m.cantidad }} {{ m.tipo === 'ENTRADA' ? 'entrada' : 'salida' }}
          </span>
        </td>
      </ng-container>
      <ng-container matColumnDef="stock">
        <th mat-header-cell *matHeaderCellDef>Stock actual</th>
        <td mat-cell *matCellDef="let m">{{ m.stockResultante }}</td>
      </ng-container>
      <ng-container matColumnDef="obs">
        <th mat-header-cell *matHeaderCellDef>Detalle</th>
        <td mat-cell *matCellDef="let m">{{ m.observacion }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>

    @if (movimientos().length === 0) {
      <p class="vacio">No hay movimientos registrados.</p>
    }
  `,
  styles: [`
    .fila { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: baseline; }
    .ancho { flex: 1 1 260px; }
    .corto { width: 120px; }
    .filtro { width: 100%; max-width: 420px; }
    .tabla { width: 100%; }
    .vacio { margin-top: 1rem; color: #666; text-align: center; }
    .entrada { color: #2e7d32; font-weight: 600; }
    .salida { color: #c62828; font-weight: 600; }
  `],
})
export class MovimientosComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly url = `${environment.apiBaseUrl}/inventario/movimientos`;

  readonly productos = signal<ProductoResponse[]>([]);
  readonly movimientos = signal<MovimientoResponse[]>([]);
  readonly filtro = signal<number | null>(null);
  readonly enviando = signal(false);
  readonly columnas = ['fecha', 'producto', 'tipo', 'stock', 'obs'];

  readonly form = this.fb.nonNullable.group({
    productoId: [null as number | null, [Validators.required]],
    tipo: ['ENTRADA', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observacion: [''],
  });

  constructor() {
    this.cargarProductos();
    this.cargar();
  }

  private cargarProductos(): void {
    this.productoService.listar().subscribe((lista) => this.productos.set(lista));
  }

  filtrar(productoId: number | null): void {
    this.filtro.set(productoId);
    this.cargar();
  }

  cargar(): void {
    let params = new HttpParams();
    if (this.filtro() !== null) {
      params = params.set('productoId', this.filtro()!);
    }
    this.http.get<MovimientoResponse[]>(this.url, { params }).subscribe((lista) => this.movimientos.set(lista));
  }

  registrar(): void {
    if (this.form.invalid) {
      return;
    }
    this.enviando.set(true);
    this.http.post<MovimientoResponse>(this.url, this.form.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Movimiento registrado', 'Cerrar', { duration: 3000 });
        this.enviando.set(false);
        this.form.patchValue({ cantidad: 1, observacion: '' });
        this.cargarProductos();
        this.cargar();
      },
      error: () => this.enviando.set(false),
    });
  }
}
