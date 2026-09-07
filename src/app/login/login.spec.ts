import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            login: () => throwError(() => ({ error: { message: 'Credenciales incorrectas.' } })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no debe llamar a la API con el formulario vacío', () => {
    component.entrar();
    expect(component.formLogin.touched).toBe(true);
  });

  it('debe mostrar el mensaje de error que devuelve la API', async () => {
    component.formLogin.setValue({ email: 'a@b.com', password: 'loquesea' });
    component.entrar();
    await fixture.whenStable();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Credenciales incorrectas.');
  });
});