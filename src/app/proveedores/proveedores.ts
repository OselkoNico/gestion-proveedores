import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProveedoresService } from '../proveedores';
import { Proveedor } from '../models/proveedor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proveedores',
  imports: [FormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class Proveedores implements OnInit {

  proveedores = signal<Proveedor[]>([]);
  error = signal('');
  cargando = signal(true);
  busqueda = signal('');
  pagina = signal(1);
  totalPaginas = signal(0);
  total = signal(0);

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor(private proveedoresService: ProveedoresService, private router: Router) {}

  cargarProveedores() {
    this.cargando.set(true);

    this.proveedoresService.getProviders(this.pagina(), this.busqueda()).subscribe({
      next: (respuesta) => {
        this.proveedores.set(respuesta.proveedores);
        this.total.set(respuesta.total);
        this.totalPaginas.set(respuesta.totalPages);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  buscar(texto: string) {
    this.busqueda.set(texto);

    clearTimeout(this.temporizador);

    this.temporizador = setTimeout(() => {
      this.pagina.set(1);
      this.cargarProveedores();
    }, 300);
  }

  irAPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas()) {
      return;
    }

    this.pagina.set(nuevaPagina);
    this.cargarProveedores();
  }

  modificarProveedor(cif: string) {
    this.router.navigate(['modificar', cif]);
  }

  eliminarProveedor(cif: string) {
    if (!confirm('¿Seguro que quieres eliminar este proveedor?')) {
      return;
    }

    this.error.set('');

    this.proveedoresService.deleteProvider(cif).subscribe({
      next: () => {
        if (this.proveedores().length === 1 && this.pagina() > 1) {
          this.pagina.update(pagina => pagina - 1);
        }

        this.cargarProveedores();
      },
      error: () => this.error.set('No se pudo eliminar el proveedor.')
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

}