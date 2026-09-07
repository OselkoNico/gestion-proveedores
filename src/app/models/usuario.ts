export interface Usuario {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

export interface RespuestaAuth {
  message: string;
  token: string;
  usuario: Usuario;
}