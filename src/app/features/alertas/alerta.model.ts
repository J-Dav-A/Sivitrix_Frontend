export type NivelAlerta = 'BAJO_STOCK' | 'CRITICO';

export interface AlertaResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  nivel: NivelAlerta;
  stockActual: number;
  stockAlGenerar: number;
  stockMinimo: number;
  faltante: number;
  fechaGeneracion: string;
  activa: boolean;
}
