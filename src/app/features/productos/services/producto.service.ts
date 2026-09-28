import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoriaProducto, ProductoRequest, ProductoResponse } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/productos`;

  listar(filtros?: { nombre?: string; categoria?: CategoriaProducto }): Observable<ProductoResponse[]> {
    let params = new HttpParams();
    if (filtros?.nombre) {
      params = params.set('nombre', filtros.nombre);
    }
    if (filtros?.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    return this.http.get<ProductoResponse[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
