import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClienteCompra, ProductoVendido, ReporteInventario, ReporteVentas } from './reporte.model';

function fechaIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h1>Reportes</h1>
    @if (ventas(); as r) {
      <p class="solo-impresion">Vitrix — Repuestos para motocicleta · Generado el {{ ahora | date: 'dd/MM/yyyy HH:mm' }}</p>
    }

    <div class="filtros no-imprimir">
      <mat-form-field appearance="outline">
        <mat-label>Desde</mat-label>
        <input matInput type="date" [(ngModel)]="desde" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Hasta</mat-label>
        <input matInput type="date" [(ngModel)]="hasta" />
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="cargar(true)" [disabled]="cargando()">
        {{ cargando() ? 'Generando...' : 'Generar' }}
      </button>
      <button mat-stroked-button (click)="imprimir()" [disabled]="!ventas()">Imprimir / Guardar PDF</button>
    </div>

    @if (inventario(); as inv) {
      <h3>Estado del inventario</h3>
      <div class="tarjetas">
        <div class="tarjeta"><span>Productos</span><strong>{{ inv.totalProductos }}</strong></div>
        <div class="tarjeta"><span>Unidades en stock</span><strong>{{ inv.unidadesEnStock | number }}</strong></div>
        <div class="tarjeta"><span>Valor al costo</span><strong>$ {{ inv.valorAlCosto | number: '1.2-2' }}</strong></div>
        <div class="tarjeta"><span>Valor a precio de venta</span><strong>$ {{ inv.valorAlPrecioVenta | number: '1.2-2' }}</strong></div>
        <div class="tarjeta"><span>Ganancia potencial</span><strong>$ {{ inv.gananciaPotencial | number: '1.2-2' }}</strong></div>
        <div class="tarjeta" [class.alerta]="inv.productosBajoMinimo > 0"><span>Bajo el mínimo</span><strong>{{ inv.productosBajoMinimo }}</strong></div>
      </div>
    }

    @if (ventas(); as v) {
      <h3>Ventas del {{ v.desde | date: 'dd/MM/yyyy' }} al {{ v.hasta | date: 'dd/MM/yyyy' }}</h3>
      <div class="tarjetas">
        <div class="tarjeta"><span>Ventas confirmadas</span><strong>{{ v.cantidadVentas }}</strong></div>
        <div class="tarjeta"><span>Subtotal</span><strong>$ {{ v.subtotal | number: '1.2-2' }}</strong></div>
        <div class="tarjeta"><span>IVA</span><strong>$ {{ v.iva | number: '1.2-2' }}</strong></div>
        <div class="tarjeta"><span>Total facturado</span><strong>$ {{ v.total | number: '1.2-2' }}</strong></div>
        <div class="tarjeta"><span>Costo de lo vendido</span><strong>$ {{ v.costo | number: '1.2-2' }}</strong></div>
        <div class="tarjeta ok"><span>Ganancia</span><strong>$ {{ v.ganancia | number: '1.2-2' }}</strong></div>
      </div>

      @if (v.porDia.length > 0) {
        <h4>Ventas por día</h4>
        <div class="barras">
          @for (d of v.porDia; track d.fecha) {
            <div class="barra-fila">
              <span class="fecha">{{ d.fecha | date: 'dd/MM' }}</span>
              <div class="barra"><div class="relleno" [style.width.%]="porcentaje(d.total)"></div></div>
              <span class="valor">$ {{ d.total | number: '1.2-2' }} ({{ d.cantidadVentas }})</span>
            </div>
          }
        </div>
      } @else {
        <p class="vacio">No hay ventas confirmadas en este rango.</p>
      }
    }

    <div class="dos-columnas">
      <section>
        <h3>Productos más vendidos</h3>
        <table class="tabla">
          <thead><tr><th>Producto</th><th class="num">Unid.</th><th class="num">Ingresos</th><th class="num">Ganancia</th></tr></thead>
          <tbody>
            @for (p of productos(); track p.productoId) {
              <tr><td>{{ p.codigo }} · {{ p.nombre }}</td><td class="num">{{ p.unidades }}</td><td class="num">$ {{ p.ingresos | number: '1.2-2' }}</td><td class="num">$ {{ p.ganancia | number: '1.2-2' }}</td></tr>
            } @empty {
              <tr><td colspan="4" class="vacio">Sin datos</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h3>Mejores clientes</h3>
        <table class="tabla">
          <thead><tr><th>Cliente</th><th class="num">Compras</th><th class="num">Total</th></tr></thead>
          <tbody>
            @for (c of clientes(); track c.clienteId) {
              <tr><td>{{ c.nombre }}</td><td class="num">{{ c.compras }}</td><td class="num">$ {{ c.total | number: '1.2-2' }}</td></tr>
            } @empty {
              <tr><td colspan="3" class="vacio">Sin datos</td></tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    .filtros { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: baseline; }
    .tarjetas { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; }
    .tarjeta { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 0.75rem 1rem; display: flex; flex-direction: column; }
    .tarjeta span { color: #666; font-size: 0.85rem; }
    .tarjeta strong { font-size: 1.2rem; }
    .tarjeta.ok { border-color: #81c784; background: #f1f8e9; }
    .tarjeta.alerta { border-color: #e57373; background: #ffebee; }
    .barras { display: flex; flex-direction: column; gap: 4px; }
    .barra-fila { display: grid; grid-template-columns: 56px 1fr 200px; align-items: center; gap: 8px; }
    .barra { background: #eceff1; height: 16px; border-radius: 4px; overflow: hidden; }
    .relleno { background: #1565c0; height: 100%; }
    .valor { font-size: 0.85rem; text-align: right; }
    .dos-columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; }
    .tabla { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 0.5rem 0.7rem; text-align: left; border-bottom: 1px solid #eee; }
    .num { text-align: right; }
    .vacio { color: #666; text-align: center; }
    .solo-impresion { display: none; color: #555; }
    @media print { .solo-impresion { display: block; } .tarjeta { break-inside: avoid; } }
  `],
})
export class ReportesComponent {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  readonly cargando = signal(false);
  ahora = new Date();
  private readonly base = `${environment.apiBaseUrl}/reportes`;

  desde = fechaIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  hasta = fechaIso(new Date());

  readonly ventas = signal<ReporteVentas | null>(null);
  readonly productos = signal<ProductoVendido[]>([]);
  readonly clientes = signal<ClienteCompra[]>([]);
  readonly inventario = signal<ReporteInventario | null>(null);

  private readonly maximo = computed(() => Math.max(1, ...(this.ventas()?.porDia.map((d) => d.total) ?? [1])));

  constructor() {
    this.cargar();
  }

  porcentaje(total: number): number {
    return (total / this.maximo()) * 100;
  }

  cargar(avisar = false): void {
    const params = new HttpParams().set('desde', this.desde).set('hasta', this.hasta);
    this.cargando.set(true);
    forkJoin({
      ventas: this.http.get<ReporteVentas>(`${this.base}/ventas`, { params }),
      productos: this.http.get<ProductoVendido[]>(`${this.base}/productos-mas-vendidos`, { params }),
      clientes: this.http.get<ClienteCompra[]>(`${this.base}/mejores-clientes`, { params }),
      inventario: this.http.get<ReporteInventario>(`${this.base}/inventario`),
    }).subscribe({
      next: (r) => {
        this.ventas.set(r.ventas);
        this.productos.set(r.productos);
        this.clientes.set(r.clientes);
        this.inventario.set(r.inventario);
        this.ahora = new Date();
        this.cargando.set(false);
        if (avisar) {
          this.snackBar.open(`Reporte generado: ${r.ventas.cantidadVentas} venta(s) en el rango`, 'Cerrar', { duration: 3000 });
        }
      },
      // El errorInterceptor ya muestra el mensaje; aqui solo se libera el boton.
      error: () => this.cargando.set(false),
    });
  }

  imprimir(): void {
    window.print();
  }
}