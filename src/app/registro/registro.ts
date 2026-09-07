import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: '../login/login.css',
})
export class Registro {

  formRegistro = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  error = signal('');
  enviando = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  registrar() {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    const email = this.formRegistro.value.email ?? '';
    const password = this.formRegistro.value.password ?? '';

    this.error.set('');
    this.enviando.set(true);

    this.authService.register(email, password).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: (respuesta) => {
        this.enviando.set(false);
        this.error.set(respuesta.error?.message ?? 'No se pudo crear la cuenta.');
      }
    });
  }
}