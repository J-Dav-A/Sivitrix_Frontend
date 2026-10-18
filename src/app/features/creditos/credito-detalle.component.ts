import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreditoService } from './credito.service';
import { CreditoResponse } from './credito.model';

@Component({
  selector: 'app-credito-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    @if (credito(); as c) {
      <h1>Crédito de la venta {{ c.ventaNumero }}</h1>
      <p>
        <strong>Cliente:</strong> {{ c.clienteNombre }} (NIT {{ c.clienteNit }}) ·
        <strong>Valor:</strong> $ {{ c.valorTotal | number: '1.2-2' }} en {{ c.numeroCuotas }} cuotas ·
        <strong>Estado:</strong> {{ c.estado }}
      </p>
      <p>
        <strong>Solicitado:</strong> {{ c.fechaSolicitud | date: 'dd/MM/yyyy HH:mm' }}
        @if (c.fechaResolucion) { · <strong>Resuelto:</strong> {{ c.fechaResolucion | date: 'dd/MM/yyyy HH:mm' }} }
        @if (c.observacion) { · <strong>Observación:</strong> {{ c.observacion }} }
      </p>

      @if (c.estado === 'PENDIENTE_AUTORIZACION') {
        <div class="acciones">
          <button mat-raised-button color="primary" (click)="autorizar(c)">Autorizar crédito</button>
          <button mat-button color="warn" (click)="rechazar(c)">Rechazar</button>
        </div>
        <p class="nota">Al autorizar se genera el plan de cuotas, se descuenta el stock y se emite la factura.</p>
      }

      @if (c.cuotas.length > 0) {
        <h3>Plan de cuotas · Saldo pendiente $ {{ c.saldoPendiente | number: '1.2-2' }}</h3>
        <table class="tabla mat-elevation-z2">
          <thead><tr><th>Cuota</th><th>Valor</th><th>Fecha límite</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            @for (q of c.cuotas; track q.id) {
              <tr>
                <td>{{ q.numero }}</td>
                <td>$ {{ q.valor | number: '1.2-2' }}</td>
                <td>{{ q.fechaLimite | date: 'dd/MM/yyyy' }}</td>
                <td [class.vencida]="q.estado === 'VENCIDA'" [class.pagada]="q.estado === 'PAGADA'">
                  {{ q.estado === 'PAGADA' ? 'Pagada el ' + (q.fechaPago | date: 'dd/MM/yyyy') : q.estado }}
                </td>
                <td>
                  @if (c.estado === 'APROBADO' && q.estado !== 'PAGADA') {
                    <button mat-button color="primary" (click)="pagar(q.id)">Registrar pago</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }

      <div class="acciones"><a mat-button routerLink="/creditos">Volver</a></div>
    }
  `,
  styles: [`
    .acciones { display: flex; gap: 0.5rem; margin: 1rem 0; }
    .nota { color: #666; font-size: 0.9rem; }
    .tabla { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 0.6rem 0.8rem; text-align: left; border-bottom: 1px solid #eee; }
    .vencida { color: #b71c1c; font-weight: 600; }
    .pagada { color: #1b5e20; }
  `],
})
export class CreditoDetalleComponent {
  private readonly service = inject(CreditoService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  readonly credito = signal<CreditoResponse | null>(null);

  constructor() {
    this.service.obtener(Number(this.route.snapshot.paramMap.get('id'))).subscribe((c) => this.credito.set(c));
  }

  autorizar(c: CreditoResponse): void {
    this.service.autorizar(c.id).subscribe((actualizado) => {
      this.snackBar.open('Crédito autorizado y venta facturada', 'Cerrar', { duration: 4000 });
      this.credito.set(actualizado);
    });
  }

  rechazar(c: CreditoResponse): void {
    const motivo = prompt('Motivo del rechazo (opcional):') ?? '';
    this.service.rechazar(c.id, motivo).subscribe((actualizado) => {
      this.snackBar.open('Crédito rechazado', 'Cerrar', { duration: 3000 });
      this.credito.set(actualizado);
    });
  }

  pagar(cuotaId: number): void {
    this.service.pagarCuota(cuotaId).subscribe((actualizado) => {
      this.snackBar.open('Pago registrado', 'Cerrar', { duration: 3000 });
      this.credito.set(actualizado);
    });
  }
}
