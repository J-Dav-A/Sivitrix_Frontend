export type EstadoPedido = 'REGISTRADO' | 'RECIBIDO_PARCIAL' | 'RECIBIDO' | 'CANCELADO';

export interface PedidoRequest {
  proveedorId: number;
  observaciones: string;
  detalles: { productoId: number; cantidad: number }[];
}

export interface PedidoDetalle {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  pendiente: number;
}

export interface PedidoResponse {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  fechaPedido: string;
  estado: EstadoPedido;
  observaciones: string | null;
  detalles: PedidoDetalle[];
}
