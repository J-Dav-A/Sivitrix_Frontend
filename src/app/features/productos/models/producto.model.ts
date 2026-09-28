export type CategoriaProducto =
  | 'LLANTAS'
  | 'BATERIAS'
  | 'FRENOS'
  | 'ACEITES'
  | 'FILTROS'
  | 'BUJIAS'
  | 'CADENAS_PINONES'
  | 'ELECTRICOS'
  | 'ACCESORIOS';

export const CATEGORIAS_PRODUCTO: CategoriaProducto[] = [
  'LLANTAS',
  'BATERIAS',
  'FRENOS',
  'ACEITES',
  'FILTROS',
  'BUJIAS',
  'CADENAS_PINONES',
  'ELECTRICOS',
  'ACCESORIOS',
];

// SWR-08: datos necesarios para registrar/actualizar un producto.
export interface ProductoRequest {
  codigo: string;
  nombre: string;
  categoria: CategoriaProducto;
  precioVenta: number;
  costoAdquisicion: number;
  stockMinimo: number;
}

// SWR-25/SWR-28: incluye margen ya calculado y diferencia con el minimo.
export interface ProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  categoria: CategoriaProducto;
  precioVenta: number;
  costoAdquisicion: number;
  margenValor: number;
  margenPorcentaje: number;
  stockActual: number;
  stockMinimo: number;
  diferenciaConMinimo: number;
  creadoEn: string;
  actualizadoEn: string;
}
