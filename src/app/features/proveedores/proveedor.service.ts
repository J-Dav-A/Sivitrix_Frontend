import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProveedorRequest, ProveedorResponse } from './proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/proveedores`;

  listar(): Observable<ProveedorResponse[]> {
    return this.http.get<ProveedorResponse[]>(this.baseUrl);
  }

  obtener(id: number): Observable<ProveedorResponse> {
    return this.http.get<ProveedorResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.put<ProveedorResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
