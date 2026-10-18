import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/productos/producto-list/producto-list.component').then(
        (m) => m.ProductoListComponent,
      ),
  },
  {
    path: 'productos/nuevo',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/productos/producto-form/producto-form.component').then(
        (m) => m.ProductoFormComponent,
      ),
  },
  {
    path: 'productos/editar/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/productos/producto-form/producto-form.component').then(
        (m) => m.ProductoFormComponent,
      ),
  },

  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/cliente-list/cliente-list.component').then(
        (m) => m.ClienteListComponent,
      ),
  },
  {
    path: 'clientes/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  {
    path: 'clientes/editar/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },

  {
    path: 'proveedores',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/proveedores/proveedor-list.component').then((m) => m.ProveedorListComponent),
  },
  {
    path: 'proveedores/nuevo',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent),
  },
  {
    path: 'proveedores/editar/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent),
  },
  {
    path: 'pedidos',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/pedidos/pedido-list.component').then((m) => m.PedidoListComponent),
  },
  {
    path: 'pedidos/nuevo',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/pedidos/pedido-form.component').then((m) => m.PedidoFormComponent),
  },
  {
    path: 'pedidos/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/pedidos/pedido-detalle.component').then((m) => m.PedidoDetalleComponent),
  },
  {
    path: 'inventario/movimientos',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/inventario/movimientos.component').then((m) => m.MovimientosComponent),
  },
  {
    path: 'alertas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alertas/alerta-list.component').then((m) => m.AlertaListComponent),
  },
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ventas/venta-list.component').then((m) => m.VentaListComponent),
  },
  {
    path: 'ventas/nueva',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ventas/venta-form.component').then((m) => m.VentaFormComponent),
  },
  {
    path: 'facturas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/facturas/factura-list.component').then((m) => m.FacturaListComponent),
  },
  {
    path: 'facturas/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/facturas/factura-detalle.component').then((m) => m.FacturaDetalleComponent),
  },
  {
    path: 'creditos',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/creditos/credito-list.component').then((m) => m.CreditoListComponent),
  },
  {
    path: 'creditos/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/creditos/credito-detalle.component').then((m) => m.CreditoDetalleComponent),
  },
  {
    path: 'reportes',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
  },

    {
    path: 'usuarios',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },

  { path: '**', redirectTo: 'productos' },
];