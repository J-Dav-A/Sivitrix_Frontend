export interface ProductoResumen {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ProveedorRequest {
  nit: string;
  nombreEmpresa: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  productosIds: number[];
}

export interface ProveedorResponse {
  id: number;
  nit: string;
  nombreEmpresa: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  productos: ProductoResumen[];
  fechaUltimoPedido: string | null;
  creadoEn: string;
  actualizadoEn: string;
}
