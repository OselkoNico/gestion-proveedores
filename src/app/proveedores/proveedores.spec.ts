import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';

import { Proveedores } from './proveedores';
import { ProveedoresService } from '../proveedores';
import { Proveedor, Respuesta } from '../models/proveedor';

const PROVEEDOR: Proveedor = {
  cif: 'B999',
  name: 'Proveedor Uno',
  activity: 'Logistica',
  address: 'C/ Sol 5',
  city: 'Sevilla',
  postalCode: '41001',
  phone: '600999888',
};

const UNA_PAGINA: Respuesta = {
  message: 'Ok',
  proveedores: [PROVEEDOR],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('Proveedores', () => {
  let component: Proveedores;
  let fixture: ComponentFixture<Proveedores>;
  let respuesta$: Subject<Respuesta>;

  beforeEach(async () => {
    respuesta$ = new Subject();
    await TestBed.configureTestingModule({
      imports: [Proveedores],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ProveedoresService,
          useValue: {
            getProviders: () => respuesta$,
            deleteProvider: () => of({ message: 'Ok', deletedProvider: PROVEEDOR }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Proveedores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe pintar en el DOM los proveedores que llegan del servicio', async () => {
    const html = fixture.nativeElement as HTMLElement;
    respuesta$.next(UNA_PAGINA);
    await fixture.whenStable();

    expect(html.querySelectorAll('tbody tr').length).toBe(1);
    expect(html.textContent).toContain('Proveedor Uno');
  });

  it('no debe mostrar los controles de paginación con una sola página', async () => {
    const html = fixture.nativeElement as HTMLElement;
    respuesta$.next(UNA_PAGINA);
    await fixture.whenStable();

    expect(html.querySelector('.paginacion')).toBeNull();
  });

  it('debe mostrar los controles de paginación con varias páginas', async () => {
    const html = fixture.nativeElement as HTMLElement;
    respuesta$.next({ ...UNA_PAGINA, total: 25, totalPages: 3 });
    await fixture.whenStable();

    expect(html.querySelector('.paginacion')).not.toBeNull();
    expect(html.textContent).toContain('Página 1 de 3');
  });
});