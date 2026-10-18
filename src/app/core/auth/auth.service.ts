import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Rol = 'ADMINISTRADOR' | 'VENDEDOR';

interface Sesion {
  usuario: string;
  rol: Rol;
  token: string;
}

const CLAVE_SESION = 'sivitrix.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesion = signal<Sesion | null>(this.leer());

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly rol = computed(() => this.sesion()?.rol ?? null);
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly esAdmin = computed(() => this.sesion()?.rol === 'ADMINISTRADOR');

  login(usuario: string, clave: string): Observable<{ usuario: string; rol: Rol }> {
    const token = btoa(unescape(encodeURIComponent(`${usuario}:${clave}`)));
    const headers = new HttpHeaders({ Authorization: `Basic ${token}` });
    return this.http
      .get<{ usuario: string; rol: Rol }>(`${environment.apiBaseUrl}/auth/me`, { headers })
      .pipe(
        tap((r) => {
          const s: Sesion = { usuario: r.usuario, rol: r.rol, token };
          this.sesion.set(s);
          try {
            sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s));
          } catch {
            /* sin almacenamiento */
          }
        }),
      );
  }

  logout(redirigir = true): void {
    this.sesion.set(null);
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      /* nada */
    }
    if (redirigir) {
      this.router.navigate(['/login']);
    }
  }

  token(): string | null {
    return this.sesion()?.token ?? null;
  }

  private leer(): Sesion | null {
    try {
      const raw = sessionStorage.getItem(CLAVE_SESION);
      return raw ? (JSON.parse(raw) as Sesion) : null;
    } catch {
      return null;
    }
  }
}