import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClienteService } from '../services/cliente.service';
import { ClienteResponse } from '../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss',
})
export class ClienteListComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly cargando = signal(false);
  readonly busqueda = new FormControl('', { nonNullable: true });

  readonly columnas = ['nit', 'nombre', 'contacto', 'saldoCredito', 'acciones'];

  ngOnInit(): void {
    this.busqueda.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.cargar(q));
  }

  cargar(q?: string): void {
    this.cargando.set(true);
    this.clienteService.listar(q).subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  eliminar(cliente: ClienteResponse): void {
    if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) {
      return;
    }
    this.clienteService.eliminar(cliente.id).subscribe(() => {
      this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 });
      this.cargar(this.busqueda.value);
    });
  }
}