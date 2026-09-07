import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth';

describe('AuthService', () => {

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
  });

  it('should be created', () => {
    expect(TestBed.inject(AuthService)).toBeTruthy();
  });

  it('no hay sesión cuando el almacenamiento está vacío', () => {
    const service = TestBed.inject(AuthService);

    expect(service.autenticado()).toBe(false);
    expect(service.esAdmin()).toBe(false);
  });

  it('recupera la sesión guardada al construirse', () => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({ id: 1, email: 'admin@ejemplo.com', role: 'admin' })
    );

    const service = TestBed.inject(AuthService);

    expect(service.autenticado()).toBe(true);
    expect(service.esAdmin()).toBe(true);
  });

  it('descarta un usuario guardado que no sea JSON válido', () => {
    localStorage.setItem('usuario', 'esto-no-es-json');

    const service = TestBed.inject(AuthService);

    expect(service.autenticado()).toBe(false);
  });

  it('limpia el almacenamiento al cerrar sesión', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem(
      'usuario',
      JSON.stringify({ id: 1, email: 'usuario@ejemplo.com', role: 'user' })
    );

    const service = TestBed.inject(AuthService);
    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(service.autenticado()).toBe(false);
  });

});