import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../services/cliente.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly enviando = signal(false);

  private readonly clienteId = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = !!this.clienteId;

  readonly form = this.fb.nonNullable.group({
    nit: ['', [Validators.required, Validators.pattern(/^\d{7,15}(-\d)?$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    contactoNombre: ['', [Validators.required, Validators.maxLength(150)]],
    contactoCedula: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
  });

  constructor() {
    if (this.esEdicion) {
      this.form.controls.nit.disable();
      this.cargarCliente(Number(this.clienteId));
    }
  }

  private cargarCliente(id: number): void {
    this.clienteService.obtener(id).subscribe((cliente) => {
      this.form.patchValue({
        nit: cliente.nit,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        email: cliente.email,
        contactoNombre: cliente.contactoNombre,
        contactoCedula: cliente.contactoCedula,
      });
    });
  }

    guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const request = this.form.getRawValue();

    const operacion = this.esEdicion
      ? this.clienteService.actualizar(Number(this.clienteId), request)
      : this.clienteService.crear(request);

    operacion.subscribe({
      next: () => {
        const mensaje = this.esEdicion ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 409) {
          this.form.controls.nit.setErrors({ duplicado: true });
        }
      },
    });
  }
}