import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClienteRequest, ClienteResponse } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/clientes`;

  listar(nombre?: string): Observable<ClienteResponse[]> {
    let params = new HttpParams();
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    return this.http.get<ClienteResponse[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
