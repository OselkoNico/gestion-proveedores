import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedoresService } from '../proveedores';
import { Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-proveedor',
  imports: [ReactiveFormsModule],
  templateUrl: './proveedor.html',
  styleUrl: './proveedor.css',
})
export class ProveedorComponent implements OnInit{
  formFormulario!: FormGroup;
  esModificacion = signal(false);
  error = signal('');
  guardando = signal(false);

  constructor(
    private proveedoresService: ProveedoresService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute
  ) {}

  guardar() {
    if (this.formFormulario.invalid) {
      this.formFormulario.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.guardando.set(true);
    this.esModificacion() ? this.updateProvider() : this.createProvider();
  }

  createProvider() {
    const proveedor = this.formFormulario.value;

    this.proveedoresService.createProvider(proveedor).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: (respuesta) => {
        this.guardando.set(false);
        this.error.set(respuesta.error?.message ?? 'No se pudo crear el proveedor.');
      }
    });
  }

  updateProvider() {
    const proveedor = this.formFormulario.value;
    const cif = this.activatedRoute.snapshot.params['cif'];

    this.proveedoresService.updateProvider(cif, proveedor).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: (respuesta) => {
        this.guardando.set(false);
        this.error.set(respuesta.error?.message ?? 'No se pudo modificar el proveedor.');
      }
    });
  }

  ngOnInit(): void {
    this.formFormulario = new FormGroup({
      cif: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      activity: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      postalCode: new FormControl('', Validators.pattern(/^\d{5}$/)),
      phone: new FormControl('', Validators.pattern(/^\d{9}$/)),
    })
    const cif = this.activatedRoute.snapshot.params['cif'];
    
    if(cif){
      this.esModificacion.set(true);
      this.proveedoresService.getProviderByCif(cif).subscribe({
        next: (respuesta) => this.formFormulario.patchValue(respuesta.company),
        error: () => this.error.set('No se encontró el proveedor solicitado.')
      });
    }
  }
}
