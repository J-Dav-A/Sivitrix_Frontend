import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacturaResponse, VentaRequest, VentaResponse } from './venta.model';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ventas`;

  listar(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.baseUrl, request);
  }

  cancelar(id: number, motivo: string): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(`${this.baseUrl}/${id}/cancelar`, { motivo });
  }

  facturas(): Observable<FacturaResponse[]> {
    return this.http.get<FacturaResponse[]>(`${environment.apiBaseUrl}/facturas`);
  }

  factura(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${environment.apiBaseUrl}/facturas/${id}`);
  }
}
