import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreditoResponse, EstadoCredito } from './credito.model';

@Injectable({ providedIn: 'root' })
export class CreditoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/creditos`;

  listar(estado?: EstadoCredito | ''): Observable<CreditoResponse[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<CreditoResponse[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<CreditoResponse> {
    return this.http.get<CreditoResponse>(`${this.baseUrl}/${id}`);
  }

  autorizar(id: number): Observable<CreditoResponse> {
    return this.http.post<CreditoResponse>(`${this.baseUrl}/${id}/autorizar`, {});
  }

  rechazar(id: number, motivo: string): Observable<CreditoResponse> {
    return this.http.post<CreditoResponse>(`${this.baseUrl}/${id}/rechazar`, { motivo });
  }

  pagarCuota(cuotaId: number): Observable<CreditoResponse> {
    return this.http.post<CreditoResponse>(`${this.baseUrl}/cuotas/${cuotaId}/pagos`, {});
  }
}
