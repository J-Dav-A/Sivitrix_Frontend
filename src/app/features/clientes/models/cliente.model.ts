// SWR-01, SWR-35, SWR-36: datos necesarios para registrar un cliente empresarial.
export interface ClienteRequest {
  nit: string;
  nombre: string;
  telefono: string;
  direccion: string;
  email: string;
  contactoNombre: string;
  contactoCedula: string;
}

// SWR-37: incluye el saldo de crédito acumulado.
export interface ClienteResponse {
  id: number;
  nit: string;
  nombre: string;
  telefono: string;
  direccion: string;
  email: string;
  contactoNombre: string;
  contactoCedula: string;
  saldoCredito: number;
  creadoEn: string;
  actualizadoEn: string;
}
