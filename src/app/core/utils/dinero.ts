/**
 * SWR-20: dos decimales, redondeando siempre hacia arriba (igual que
 * MoneyUtils.redondear en el backend). El toFixed evita errores de
 * punto flotante (p. ej. 10.01 * 100 = 1000.9999999999999).
 */
export function redondearArriba(valor: number): number {
  return Math.ceil(Number((valor * 100).toFixed(6))) / 100;
}

export const TASA_IVA = 0.19;
