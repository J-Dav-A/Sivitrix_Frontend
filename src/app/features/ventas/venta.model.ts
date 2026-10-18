export type TipoPago = 'CONTADO' | 'CREDITO';
export type EstadoVenta = 'PENDIENTE_AUTORIZACION' | 'CONFIRMADA' | 'RECHAZADA' | 'CANCELADA';

export interface VentaRequest {
  clienteId: number;
  tipoPago: TipoPago;
  numeroCuotas: number | null;
  detalles: { productoId: number; cantidad: number }[];
}

export interface VentaDetalle {
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  numero: string;
  clienteId: number;
  clienteNit: string;
  clienteNombre: string;
  fecha: string;
  tipoPago: TipoPago;
  estado: EstadoVenta;
  subtotal: number;
  iva: number;
  total: number;
  facturaId: number | null;
  detalles: VentaDetalle[];
}

export interface FacturaResponse {
  id: number;
  numero: string;
  ventaId: number;
  fechaEmision: string;
  tipoPago: TipoPago;
  cliente: { nit: string; nombre: string; direccion: string; telefono: string; email: string };
  lineas: { productoCodigo: string; productoNombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  subtotal: number;
  iva: number;
  total: number;
}
