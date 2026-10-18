import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioResponse } from './usuario.model';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h1>Usuarios</h1>

    <form [formGroup]="form" (ngSubmit)="crear()" class="formulario">
      <mat-form-field appearance="outline">
        <mat-label>Usuario</mat-label>
        <input matInput formControlName="username" autocomplete="off" />
        @if (form.controls.username.invalid && form.controls.username.touched) {
          <mat-error>3 a 30 caracteres: letras, números, punto, guion o guion bajo</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Clave</mat-label>
        <input matInput type="password" formControlName="password" autocomplete="new-password" />
        @if (form.controls.password.invalid && form.controls.password.touched) {
          <mat-error>Mínimo 6 caracteres</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Rol</mat-label>
        <mat-select formControlName="rol">
          <mat-option value="VENDEDOR">Vendedor</mat-option>
          <mat-option value="ADMINISTRADOR">Administrador</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || guardando()">
        <mat-icon>person_add</mat-icon> Crear usuario
      </button>
    </form>

    <table mat-table [dataSource]="usuarios()" class="mat-elevation-z2 tabla">
      <ng-container matColumnDef="username">
        <th mat-header-cell *matHeaderCellDef>Usuario</th>
        <td mat-cell *matCellDef="let u">
          {{ u.username }}
          @if (u.principal) {
            <span class="etiqueta">Principal</span>
          }
        </td>
      </ng-container>
      <ng-container matColumnDef="rol">
        <th mat-header-cell *matHeaderCellDef>Rol</th>
        <td mat-cell *matCellDef="let u">{{ u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Vendedor' }}</td>
      </ng-container>
      <ng-container matColumnDef="creado">
        <th mat-header-cell *matHeaderCellDef>Creado</th>
        <td mat-cell *matCellDef="let u">{{ u.creadoEn | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let u">
          @if (!u.principal && u.username !== auth.usuario()) {
            <button mat-icon-button color="warn" (click)="eliminar(u)" aria-label="Eliminar">
              <mat-icon>delete</mat-icon>
            </button>
          }
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr>
      <tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table>
  `,
  styles: [`
    .formulario { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: baseline; margin-bottom: 1rem; }
    .tabla { width: 100%; }
    .etiqueta { margin-left: 8px; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; background: #e3f2fd; color: #0d47a1; }
  `],
})
export class UsuariosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly guardando = signal(false);
  readonly columnas = ['username', 'rol', 'creado', 'acciones'];

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(60)]],
    rol: ['VENDEDOR' as 'ADMINISTRADOR' | 'VENDEDOR', Validators.required],
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe((l) => this.usuarios.set(l));
  }

  crear(): void {
    if (this.form.invalid) {
      return;
    }
    this.guardando.set(true);
    this.service.crear(this.form.getRawValue()).subscribe({
      next: (u) => {
        this.guardando.set(false);
        this.snackBar.open(`Usuario "${u.username}" creado`, 'Cerrar', { duration: 3000 });
        this.form.reset({ username: '', password: '', rol: 'VENDEDOR' });
        this.cargar();
      },
      error: () => this.guardando.set(false),
    });
  }

  eliminar(u: UsuarioResponse): void {
    if (!confirm(`¿Eliminar el usuario "${u.username}"?`)) {
      return;
    }
    this.service.eliminar(u.id).subscribe(() => {
      this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }
}