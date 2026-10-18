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
    path: 'productos/editar/:id',
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
  {
    path: 'clientes/editar/:id',
    loadComponent: () =>
      import('./features/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },

  {
    path: 'proveedores',
    loadComponent: () => import('./features/proveedores/proveedor-list.component').then((m) => m.ProveedorListComponent),
  },
  {
    path: 'proveedores/nuevo',
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent),
  },
  {
    path: 'proveedores/editar/:id',
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent),
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./features/pedidos/pedido-list.component').then((m) => m.PedidoListComponent),
  },
  {
    path: 'pedidos/nuevo',
    loadComponent: () => import('./features/pedidos/pedido-form.component').then((m) => m.PedidoFormComponent),
  },
  {
    path: 'pedidos/:id',
    loadComponent: () => import('./features/pedidos/pedido-detalle.component').then((m) => m.PedidoDetalleComponent),
  },
  {
    path: 'inventario/movimientos',
    loadComponent: () => import('./features/inventario/movimientos.component').then((m) => m.MovimientosComponent),
  },
  {
    path: 'alertas',
    loadComponent: () => import('./features/alertas/alerta-list.component').then((m) => m.AlertaListComponent),
  },
  {
    path: 'ventas',
    loadComponent: () => import('./features/ventas/venta-list.component').then((m) => m.VentaListComponent),
  },
  {
    path: 'ventas/nueva',
    loadComponent: () => import('./features/ventas/venta-form.component').then((m) => m.VentaFormComponent),
  },
  {
    path: 'facturas',
    loadComponent: () => import('./features/facturas/factura-list.component').then((m) => m.FacturaListComponent),
  },
  {
    path: 'facturas/:id',
    loadComponent: () => import('./features/facturas/factura-detalle.component').then((m) => m.FacturaDetalleComponent),
  },
  {
    path: 'creditos',
    loadComponent: () => import('./features/creditos/credito-list.component').then((m) => m.CreditoListComponent),
  },
  {
    path: 'creditos/:id',
    loadComponent: () => import('./features/creditos/credito-detalle.component').then((m) => m.CreditoDetalleComponent),
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
  },

  { path: '**', redirectTo: 'productos' },
];