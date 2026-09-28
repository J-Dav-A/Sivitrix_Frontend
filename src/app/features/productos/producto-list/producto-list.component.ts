import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';
import { ProductoResponse } from '../models/producto.model';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
  ],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss',
})
export class ProductoListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly snackBar = inject(MatSnackBar);

  readonly productos = signal<ProductoResponse[]>([]);
  readonly cargando = signal(false);

  readonly columnas = [
    'codigo',
    'nombre',
    'categoria',
    'precioVenta',
    'margenPorcentaje',
    'stock',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(nombre?: string): void {
    this.cargando.set(true);
    this.productoService.listar({ nombre }).subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  eliminar(producto: ProductoResponse): void {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }
    this.productoService.eliminar(producto.id).subscribe(() => {
      this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }

  // SWR-11: resalta visualmente los productos por debajo del stock minimo.
  bajoStock(producto: ProductoResponse): boolean {
    return producto.diferenciaConMinimo <= 0;
  }
}
