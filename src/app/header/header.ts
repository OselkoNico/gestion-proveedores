import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {

  constructor(public authService: AuthService, private router: Router) {}

  salir() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}