import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Proveedores } from './proveedores/proveedores';
import { ProveedorComponent } from './proveedor/proveedor';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { authGuard, adminGuard } from './guards/auth-guard';

export const routes: Routes = [

    {
        path: '',
        component: Inicio,
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: Login
    },

    {
        path: 'registro',
        component: Registro
    },

    {
        path: 'proveedores',
        component: Proveedores,
        canActivate: [authGuard]
    },

    {
        path: 'crear',
        component: ProveedorComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: 'modificar/:cif',
        component: ProveedorComponent,
        canActivate: [authGuard, adminGuard]
    },

    {
        path: '**',
        redirectTo: ''
    }

];