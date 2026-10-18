import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoRequest, PedidoResponse } from './pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pedidos`;

  listar(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.baseUrl, request);
  }

  recibir(id: number, lineas: { detalleId: number; cantidad: number }[]): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.baseUrl}/${id}/recepcion`, { lineas });
  }

  cancelar(id: number): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}
