import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { VentaService } from '../ventas/venta.service';
import { FacturaResponse } from '../ventas/venta.model';

@Component({
  selector: 'app-factura-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    @if (factura(); as f) {
      <div class="no-imprimir acciones">
        <a mat-button routerLink="/facturas">Volver</a>
        <button mat-raised-button color="primary" (click)="imprimir()">Imprimir</button>
      </div>

      <article class="factura mat-elevation-z3">
        @if (f.anulada) {
          <p class="anulada">FACTURA ANULADA — la venta fue cancelada</p>
        }
        <header>
          <div>
            <h2>Vitrix — Repuestos para motocicleta</h2>
            <p>Venta al por mayor · Armenia, Quindío</p>
          </div>
          <div class="numero">
            <strong>Factura {{ f.numero }}</strong>
            <span>{{ f.fechaEmision | date: 'dd/MM/yyyy HH:mm' }}</span>
            <span>Pago: {{ f.tipoPago === 'CONTADO' ? 'Contado' : 'Crédito' }}</span>
          </div>
        </header>

        <section class="cliente">
          <strong>{{ f.cliente.nombre }}</strong>
          <span>NIT {{ f.cliente.nit }}</span>
          <span>{{ f.cliente.direccion }} · Tel. {{ f.cliente.telefono }}</span>
          <span>{{ f.cliente.email }}</span>
        </section>

        <table>
          <thead>
            <tr><th>Código</th><th>Producto</th><th class="num">Cant.</th><th class="num">Precio unit.</th><th class="num">Subtotal</th></tr>
          </thead>
          <tbody>
            @for (l of f.lineas; track $index) {
              <tr>
                <td>{{ l.productoCodigo }}</td>
                <td>{{ l.productoNombre }}</td>
                <td class="num">{{ l.cantidad }}</td>
                <td class="num">$ {{ l.precioUnitario | number: '1.2-2' }}</td>
                <td class="num">$ {{ l.subtotal | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="totales">
          <div><span>Subtotal</span><span>$ {{ f.subtotal | number: '1.2-2' }}</span></div>
          <div><span>IVA 19 %</span><span>$ {{ f.iva | number: '1.2-2' }}</span></div>
          <div class="total"><span>TOTAL</span><span>$ {{ f.total | number: '1.2-2' }}</span></div>
        </div>
      </article>
    }
  `,
  styles: [`
    .anulada { color: #b71c1c; border: 2px solid #b71c1c; text-align: center; font-weight: 700; padding: 0.5rem; margin: 0 0 1rem; }
    .acciones { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .factura { background: white; padding: 2rem; max-width: 800px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; border-bottom: 2px solid #1565c0; padding-bottom: 1rem; }
    header h2 { margin: 0; color: #1565c0; }
    header p { margin: 0.25rem 0 0; color: #555; }
    .numero { display: flex; flex-direction: column; text-align: right; }
    .cliente { display: flex; flex-direction: column; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
    .num { text-align: right; }
    .totales { margin: 1rem 0 0 auto; max-width: 300px; }
    .totales div { display: flex; justify-content: space-between; padding: 3px 0; }
    .totales .total { border-top: 2px solid #333; margin-top: 4px; padding-top: 6px; font-weight: 700; font-size: 1.15rem; }
    @media print { .no-imprimir { display: none; } .factura { box-shadow: none; } }
  `],
})
export class FacturaDetalleComponent {
  private readonly service = inject(VentaService);
  private readonly route = inject(ActivatedRoute);
  readonly factura = signal<FacturaResponse | null>(null);

  constructor() {
    this.service.factura(Number(this.route.snapshot.paramMap.get('id'))).subscribe((f) => this.factura.set(f));
  }

  imprimir(): void {
    window.print();
  }
}
