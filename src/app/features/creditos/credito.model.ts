export type EstadoCredito = 'PENDIENTE_AUTORIZACION' | 'APROBADO' | 'RECHAZADO' | 'PAGADO' | 'CANCELADO';
export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

export interface CuotaResponse {
  id: number;
  numero: number;
  valor: number;
  fechaLimite: string;
  estado: EstadoCuota;
  fechaPago: string | null;
}

export interface CreditoResponse {
  id: number;
  ventaId: number;
  ventaNumero: string;
  clienteId: number;
  clienteNit: string;
  clienteNombre: string;
  valorTotal: number;
  numeroCuotas: number;
  estado: EstadoCredito;
  fechaSolicitud: string;
  fechaResolucion: string | null;
  observacion: string | null;
  saldoPendiente: number;
  cuotas: CuotaResponse[];
}
