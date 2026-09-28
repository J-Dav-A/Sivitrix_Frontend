import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },

  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/producto-list/producto-list.component').then(
        (m) => m.ProductoListComponent,
      ),
  },
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('./features/productos/producto-form/producto-form.component').then(
        (m) => m.ProductoFormComponent,
      ),
  },

  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clientes/cliente-list/cliente-list.component').then(
        (m) => m.ClienteListComponent,
      ),
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./features/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },

  { path: '**', redirectTo: 'productos' },
];
