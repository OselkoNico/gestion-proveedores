import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  error = signal('');
  enviando = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  entrar() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const email = this.formLogin.value.email ?? '';
    const password = this.formLogin.value.password ?? '';

    this.error.set('');
    this.enviando.set(true);

    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: (respuesta) => {
        this.enviando.set(false);
        this.error.set(respuesta.error?.message ?? 'No se pudo iniciar sesión.');
      }
    });
  }
}