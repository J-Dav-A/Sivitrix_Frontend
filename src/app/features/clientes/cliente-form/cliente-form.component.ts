import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly enviando = { value: false };

  // SWR-35/SWR-36: mismas reglas de formato que el backend (NIT, cedula, etc.)
  readonly form = this.fb.nonNullable.group({
    nit: ['', [Validators.required, Validators.pattern(/^\d{7,15}(-\d)?$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    contactoNombre: ['', [Validators.required, Validators.maxLength(150)]],
    contactoCedula: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.value = true;

    this.clienteService.crear(this.form.getRawValue()).subscribe({
      next: () => {
        this.snackBar.open('Cliente registrado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.enviando.value = false;
      },
    });
  }
}
