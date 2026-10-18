export interface ReporteVentas {
  desde: string;
  hasta: string;
  cantidadVentas: number;
  subtotal: number;
  iva: number;
  total: number;
  costo: number;
  ganancia: number;
  porDia: { fecha: string; cantidadVentas: number; total: number }[];
}

export interface ProductoVendido {
  productoId: number;
  codigo: string;
  nombre: string;
  unidades: number;
  ingresos: number;
  ganancia: number;
}

export interface ClienteCompra {
  clienteId: number;
  nit: string;
  nombre: string;
  compras: number;
  total: number;
}

export interface ReporteInventario {
  totalProductos: number;
  unidadesEnStock: number;
  valorAlCosto: number;
  valorAlPrecioVenta: number;
  gananciaPotencial: number;
  productosBajoMinimo: number;
}
