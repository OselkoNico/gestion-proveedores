# Gestión de Proveedores

Aplicación web CRUD para gestionar un catálogo de proveedores: alta, listado,
modificación y baja. Frontend en Angular 21 y API REST en Node.js con Express.

- **Frontend:** este repositorio
- **Backend:** [Angular-NodeJS-Backend](https://github.com/OselkoNico/Angular-NodeJS-Backend)

## Stack

| Capa        | Tecnología                                                               |
| ----------- | ------------------------------------------------------------------------ |
| Frontend    | Angular 21 (standalone components, signals, control flow `@if` / `@for`) |
| Formularios | Reactive Forms                                                           |
| Backend     | Node.js + Express 5 (ESM)                                                |
| Tests       | Vitest                                                                   |
| Lenguaje    | TypeScript 5.9                                                           |

## Puesta en marcha

Requiere Node.js 20 o superior. Son **dos repositorios independientes**, así que
hay que clonarlos por separado y levantar los dos a la vez, cada uno en su
terminal.

**1. Levantar la API** (puerto 3000):

```bash
git clone https://github.com/OselkoNico/Angular-NodeJS-Backend.git
cd Angular-NodeJS-Backend
npm install
npm start
```

**2. Levantar el frontend** (puerto 4200), en otra terminal:

```bash
git clone https://github.com/OselkoNico/gestion-proveedores.git
cd gestion-proveedores
npm install
npm start
```

Abrir <http://localhost:4200>.

El frontend apunta a `http://localhost:3000/proveedores`, así que la API tiene
que estar levantada antes o el listado mostrará un error de conexión.

## Funcionalidad

- **Inicio** (`/`) — pantalla de bienvenida con acceso a las dos secciones.
- **Añadir** (`/crear`) — formulario de alta con validación de campos obligatorios.
- **Listado** (`/proveedores`) — tabla de proveedores con buscador y acciones de
  modificar y eliminar.
- **Modificar** (`/modificar/:cif`) — el mismo formulario, precargado con los
  datos del proveedor.

Detalles de la interfaz:

- El **buscador** filtra por nombre de empresa o por CIF, sin distinguir
  mayúsculas. Cuando no hay coincidencias se distingue entre «no tienes
  proveedores» y «la búsqueda no encuentra nada», que no son lo mismo.
- Mientras la petición está en vuelo se muestra un **estado de carga**, en lugar
  de un «no hay proveedores» que sería falso.
- **Eliminar pide confirmación** antes de lanzar la petición.
- Al **modificar**, el CIF aparece en solo lectura: es el identificador y el
  backend lo descarta en el `PUT`, así que dejarlo editable haría creer al
  usuario que se puede cambiar.
- El botón de guardar **se bloquea durante el envío**, para evitar que un doble
  clic genere dos altas.
- Los **errores de validación se muestran bajo cada campo** en cuanto se ha
  interactuado con él.

Los errores devueltos por la API (CIF duplicado, proveedor inexistente, servidor
caído) se muestran en pantalla en lugar de fallar en silencio. Cualquier ruta no
reconocida redirige a Inicio.

## Decisiones de diseño

**Un único componente de formulario para alta y modificación.** Las rutas
`/crear` y `/modificar/:cif` comparten `ProveedorComponent` en lugar de
duplicarlo en dos componentes. El modo se determina por la presencia del
parámetro de ruta `:cif`: si existe, se cargan los datos del proveedor desde
la API y el formulario funciona en modo modificación; si no, funciona como
alta.

Ambos casos usan los mismos siete campos, las mismas validaciones y los
mismos estilos, por lo que separarlos habría duplicado plantilla, CSS y
lógica sin aportar diferencias funcionales.

**La cabecera es un componente propio.** El bloque de título y navegación
estaba copiado literalmente en las tres plantillas, y sus estilos repetidos
en dos hojas CSS además de en la global. Cualquier cambio en el menú obligaba
a tocar tres ficheros y era cuestión de tiempo que se desincronizaran.

Ahora `Header` se declara una sola vez en `app.html`, por encima del
`<router-outlet>`, de modo que aparece en todas las rutas sin que ningún
componente de pantalla tenga que ocuparse de ella. Sus estilos viven
únicamente en `styles.css`. El enlace de la sección activa se resalta con
`routerLinkActive`; el de Inicio necesita `[routerLinkActiveOptions]="{ exact: true }"`
porque `/` es prefijo de todas las demás rutas y, sin eso, quedaría marcado
siempre.

## API REST

Base: `http://localhost:3000/proveedores`

| Método   | Ruta    | Descripción                  | Respuestas                               |
| -------- | ------- | ---------------------------- | ---------------------------------------- |
| `GET`    | `/`     | Lista todos los proveedores  | `200`                                    |
| `GET`    | `/:cif` | Obtiene un proveedor por CIF | `200`, `404`                             |
| `POST`   | `/`     | Crea un proveedor            | `201`, `400` si falta el CIF o ya existe |
| `PUT`    | `/:cif` | Modifica un proveedor        | `200`, `400`, `404`                      |
| `DELETE` | `/:cif` | Elimina un proveedor         | `200`, `404`                             |

El CIF actúa como identificador y no es modificable: el `PUT` lo descarta del
cuerpo de la petición.

Modelo de proveedor:

```ts
interface Proveedor {
  cif: string;
  name: string;
  activity: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}
```

## Estructura

```
src/
├── styles.css             # Estilos globales, incluidos los de la cabecera
└── app/
    ├── app.ts             # Componente raíz: cabecera + router-outlet
    ├── app.routes.ts      # Rutas + comodín que redirige a Inicio
    ├── app.config.ts      # Providers (router, HttpClient)
    ├── proveedores.ts     # Servicio HTTP contra la API
    ├── models/            # Interfaces del modelo y de las respuestas
    ├── header/            # Cabecera compartida por todas las pantallas
    ├── inicio/            # Pantalla de bienvenida
    ├── proveedores/       # Listado con buscador y acciones
    └── proveedor/         # Formulario de alta y modificación
```

## Nota técnica: detección de cambios sin Zone.js

Angular 21 no incluye `zone.js` por defecto, así que la aplicación se ejecuta en
**modo zoneless**. Esto cambia una regla fundamental: el framework ya no parchea
`setTimeout`, promesas ni observables, y solo repinta cuando algo se lo notifica
explícitamente.

**Notifican:** escribir en un `signal` leído por la plantilla, el pipe `async`,
los eventos de plantilla (`(click)`, `routerLink`) y `ChangeDetectorRef.markForCheck()`.

**No notifican:** asignar a una propiedad normal dentro de un `subscribe`,
un `setTimeout` o un `.then()`.

Por eso el estado que llega de forma asíncrona vive en signals:

```ts
proveedores = signal<Proveedor[]>([]);

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
```

Con una propiedad normal (`this.proveedores = respuesta.proveedores`) los datos
llegan del servidor pero la tabla nunca se pinta. El síntoma es
característico: la lista aparece vacía aunque la API devuelva registros, y al
eliminar hay que pulsar el botón dos veces — el primer clic ejecuta el borrado
y el segundo, al ser un evento de plantilla, es el que fuerza el repintado.

El buscador se apoya en lo mismo: `proveedoresFiltrados` es un `computed`, no
un método, de modo que se recalcula solo cuando cambian `busqueda()` o
`proveedores()`. Un método normal daría el mismo resultado en pantalla, pero
volvería a ejecutar el `filter` en cada ciclo de detección de cambios.

### Cómo se detecta en los tests

`src/app/proveedores/proveedores.spec.ts` cubre este caso, con una particularidad:
**un stub síncrono con `of(...)` no reproduce el fallo**, porque el dato llega
antes del primer render y el `fixture` dispara la detección de cambios a mano.
La respuesta tiene que emitirse _después_ del primer render, como haría una
respuesta HTTP real:

```ts
const html = fixture.nativeElement as HTMLElement;
respuesta$.next({ message: 'Ok', proveedores: [PROVEEDOR] });
await fixture.whenStable();

expect(html.querySelectorAll('tbody tr').length).toBe(1);
```

La aserción va contra el **DOM**, no contra las propiedades del componente: un
`expect(component.proveedores)` pasaría igualmente con la aplicación rota,
porque el dato sí llega — lo que no ocurre es el pintado.

## Tests

```bash
npm test
```

Cubren el renderizado del listado, el filtrado del buscador y el borrado de una
fila, siempre comprobando el DOM resultante. El test de borrado necesita
simular la confirmación del navegador, porque jsdom no implementa `confirm()`:

```ts
vi.spyOn(window, 'confirm').mockReturnValue(true);
```

## Limitaciones conocidas

- **Los datos se guardan en memoria.** El backend mantiene un array en el
  proceso, así que al reiniciar el servidor se pierde todo. Migrar a una base de
  datos es el siguiente paso natural.
- Sin autenticación ni control de acceso.
- **Sin paginación.** El buscador filtra, pero no pagina: con un catálogo grande
  se siguen pintando todas las filas en el DOM.
- La URL de la API está fijada en el servicio, sin ficheros de entorno.