import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProveedoresService } from '../proveedores';
import { Proveedor } from '../models/proveedor';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-proveedores',
  imports: [FormsModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css',
})
export class Proveedores implements OnInit{

  proveedores = signal<Proveedor[]>([]);
  error = signal('');
  cargando = signal(true);
  busqueda = signal('');

  proveedoresFiltrados = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();

    if(!texto) {
      return this.proveedores();
    }

    return this.proveedores().filter(proveedor =>
      proveedor.name.toLowerCase().includes(texto) ||
      proveedor.cif.toLowerCase().includes(texto)
    );
  });

constructor(private proveedoresService: ProveedoresService, private router: Router) {}

modificarProveedor(cif: string) {
  this.router.navigate(['modificar', cif])
}

eliminarProveedor(cif: string) {
  if(!confirm('¿Seguro que quieres eliminar este proveedor?')) {
    return;
  }

  this.error.set('');

  this.proveedoresService.deleteProvider(cif).subscribe({
    next: () => {
      this.proveedores.update(
        proveedores => proveedores.filter(proveedor => proveedor.cif !== cif)
      );
    },
    error: () => this.error.set('No se pudo eliminar el proveedor.')
  });
}

ngOnInit(): void {
  this.proveedoresService.getProviders().subscribe({
    next: (respuesta) => {
      this.proveedores.set(respuesta.proveedores);
      this.cargando.set(false);
    },
    error: () => {
      this.error.set('No se pudo conectar con el servidor.');
      this.cargando.set(false);
    }
  });
}

}
