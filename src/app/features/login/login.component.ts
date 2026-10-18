import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="caja">
      <h1>SIVITRIX</h1>
      <p class="sub">Vitrix — Repuestos para motocicleta</p>

      <form [formGroup]="form" (ngSubmit)="entrar()">
        <mat-form-field appearance="outline">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="usuario" autocomplete="username" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Clave</mat-label>
          <input matInput type="password" formControlName="clave" autocomplete="current-password" />
        </mat-form-field>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || cargando()">
          {{ cargando() ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .caja { max-width: 360px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
    h1 { margin: 0; color: #1565c0; }
    .sub { color: #666; margin: 0.25rem 0 1.5rem; }
    form { display: flex; flex-direction: column; }
    .error { color: #b71c1c; margin: 0 0 1rem; }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    clave: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid) {
      return;
    }
    const { usuario, clave } = this.form.getRawValue();
    this.cargando.set(true);
    this.error.set('');
    this.auth.login(usuario, clave).subscribe({
      next: (r) => {
        this.cargando.set(false);
        this.router.navigate([r.rol === 'ADMINISTRADOR' ? '/productos' : '/ventas']);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.status === 0 ? 'No se pudo conectar con el servidor' : 'Usuario o clave incorrectos');
      },
    });
  }
}