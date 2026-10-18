export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface MovimientoRequest {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  observacion: string;
}

export interface MovimientoResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  fecha: string;
  observacion: string | null;
  pedidoId: number | null;
  ventaId: number | null;
}
