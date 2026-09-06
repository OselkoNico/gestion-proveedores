import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { vi, describe, expect, beforeEach } from 'vitest';

import { Proveedores } from './proveedores';
import { ProveedoresService } from '../proveedores';
import { Proveedor } from '../models/proveedor';

const PROVEEDOR: Proveedor = {
  cif: 'B999',
  name: 'Proveedor Uno',
  activity: 'Logistica',
  address: 'C/ Sol 5',
  city: 'Sevilla',
  postalCode: '41001',
  phone: '600999888',
};

describe('Proveedores', () => {
  let component: Proveedores;
  let fixture: ComponentFixture<Proveedores>;
  let respuesta$: Subject<{ message: string; proveedores: Proveedor[] }>;

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

    respuesta$.next({ message: 'Ok', proveedores: [PROVEEDOR] });
    await fixture.whenStable();

    expect(html.querySelectorAll('tbody tr').length).toBe(1);
    expect(html.textContent).toContain('Proveedor Uno');
  });

  it('debe quitar del DOM la fila al eliminar', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    const html = fixture.nativeElement as HTMLElement;
    respuesta$.next({ message: 'Ok', proveedores: [PROVEEDOR] });
    await fixture.whenStable();

    html.querySelector<HTMLButtonElement>('.btn-eliminar')!.click();
    await fixture.whenStable();

    expect(html.querySelectorAll('tbody tr').length).toBe(0);
    expect(html.textContent).toContain('No hay proveedores');
  });

  it('debe filtrar la tabla al escribir en el buscador', async () => {
  const html = fixture.nativeElement as HTMLElement;
  respuesta$.next({ message: 'Ok', proveedores: [PROVEEDOR] });
  await fixture.whenStable();

  component.busqueda.set('no-existe');
  await fixture.whenStable();

  expect(html.querySelectorAll('tbody tr').length).toBe(0);
  expect(html.textContent).toContain('Sin resultados');
});
});