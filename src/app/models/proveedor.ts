export interface Proveedor{
  cif: string;
  name: string;
  activity: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface Respuesta{
  message: string;
  proveedores: Proveedor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RespuestaProveedor {
  message: string;
  company: Proveedor;
}

export interface RespuestaCreacion {
  message: string;
  proveedor: Proveedor;
}

export interface RespuestaEliminacion {
  message: string;
  deletedProvider: Proveedor;
}