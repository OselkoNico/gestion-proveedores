import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { tap } from 'rxjs';
import { RespuestaAuth, Usuario } from './models/usuario';

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/auth';

  usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  autenticado = computed(() => this.usuario() !== null);
  esAdmin = computed(() => this.usuario()?.role === 'admin');

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  register(email: string, password: string) {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/register`, { email, password })
      .pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  logout() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
  }

  getToken() {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private guardarSesion(respuesta: RespuestaAuth) {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    this.usuario.set(respuesta.usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);

    if (!guardado) {
      return null;
    }

    try {
      return JSON.parse(guardado);
    } catch {
      return null;
    }
  }
}