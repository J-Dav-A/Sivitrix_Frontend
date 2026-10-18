export type RolUsuario = 'ADMINISTRADOR' | 'VENDEDOR';

export interface UsuarioResponse {
  id: number;
  username: string;
  rol: RolUsuario;
  principal: boolean;
  creadoEn: string;
}

export interface UsuarioRequest {
  username: string;
  password: string;
  rol: RolUsuario;
}