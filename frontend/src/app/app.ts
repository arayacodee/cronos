import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly currentYear = new Date().getFullYear();

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },

      error: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
