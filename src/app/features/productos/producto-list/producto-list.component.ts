import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductoService } from '../services/producto.service';
import { CATEGORIAS_PRODUCTO, CategoriaProducto, EstadoStock, ProductoResponse } from '../models/producto.model';

@Component({
  selector: 'app-producto-list',
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
    MatChipsModule,
    MatSelectModule,
  ],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss',
})
export class ProductoListComponent {
  private readonly productoService = inject(ProductoService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly productos = signal<ProductoResponse[]>([]);
  readonly cargando = signal(false);
  readonly busqueda = new FormControl('', { nonNullable: true });
  // SWR-12: filtros por categoria y por estado de stock.
  readonly categoria = new FormControl<CategoriaProducto | ''>('', { nonNullable: true });
  readonly estadoStock = new FormControl<EstadoStock | ''>('', { nonNullable: true });
  readonly categorias = CATEGORIAS_PRODUCTO;
  readonly estados: { valor: EstadoStock; texto: string }[] = [
    { valor: 'NORMAL', texto: 'Normal' },
    { valor: 'BAJO_STOCK', texto: 'Bajo stock' },
    { valor: 'CRITICO', texto: 'Crítico (sin existencias)' },
  ];

  // SWR-26: el vendedor no ve margen ni acciones de edicion.
  readonly columnas = this.auth.esAdmin()
    ? ['codigo', 'nombre', 'categoria', 'precioVenta', 'margenPorcentaje', 'stock', 'acciones']
    : ['codigo', 'nombre', 'categoria', 'precioVenta', 'stock'];

  constructor() {
    combineLatest([
      this.busqueda.valueChanges.pipe(startWith('')),
      this.categoria.valueChanges.pipe(startWith('' as CategoriaProducto | '')),
      this.estadoStock.valueChanges.pipe(startWith('' as EstadoStock | '')),
    ])
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => this.cargar());
  }

  cargar(): void {
    this.cargando.set(true);
    this.productoService
      .listar({
        nombre: this.busqueda.value || undefined,
        categoria: this.categoria.value || undefined,
        estadoStock: this.estadoStock.value || undefined,
      })
      .subscribe({
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

  bajoStock(producto: ProductoResponse): boolean {
    return producto.diferenciaConMinimo <= 0;
  }
}