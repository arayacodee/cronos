import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

import {
  User,
  UserRole
} from '../../models/user.model';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  selectedRole =
    signal<UserRole | null>(null);

  loading = signal(false);
  errorMessage = signal('');

  private returnUrl: string | null = null;
  private googleInitialized = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParamMap.get(
        'returnUrl'
      );

    if (this.auth.isLoggedIn()) {
      this.redirectCurrentUser();
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.errorMessage.set('');

    setTimeout(() => {
      this.renderGoogleButton();
    });
  }

  private renderGoogleButton(
    attempt = 0
  ): void {
    const google = window.google;

    const container =
      document.getElementById(
        'google-signin-button'
      );

    if (!container) {
      return;
    }

    if (!google) {
      if (attempt < 50) {
        setTimeout(
          () =>
            this.renderGoogleButton(
              attempt + 1
            ),
          100
        );

        return;
      }

      this.errorMessage.set(
        'No fue posible cargar Google.'
      );

      return;
    }

    if (!this.googleInitialized) {
      google.accounts.id.initialize({
        client_id:
          environment.googleClientId,

        callback: (
          response:
            GoogleCredentialResponse
        ) => {
          this.handleGoogleCredential(
            response
          );
        }
      });

      this.googleInitialized = true;
    }

    container.innerHTML = '';

    google.accounts.id.renderButton(
      container,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320,
        locale: 'es'
      }
    );
  }

  private handleGoogleCredential(
    response: GoogleCredentialResponse
  ): void {
    const role = this.selectedRole();

    if (!role) {
      this.errorMessage.set(
        'Selecciona primero el tipo de cuenta.'
      );

      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth
      .loginWithGoogle(
        response.credential,
        role
      )
      .subscribe({
        next: (user) => {
          this.loading.set(false);

          this.navigateAfterLogin(user);
        },

        error: (error) => {
          console.error(error);

          this.loading.set(false);

          this.errorMessage.set(
            error?.error?.error ??
              'No fue posible iniciar sesión con Google.'
          );
        }
      });
  }

  private navigateAfterLogin(
    user: User
  ): void {
    if (
      this.returnUrl &&
      this.canAccessReturnUrl(
        user,
        this.returnUrl
      )
    ) {
      this.router.navigateByUrl(
        this.returnUrl
      );

      return;
    }

    if (user.role === 'PROFESSIONAL') {
      this.router.navigate([
        '/dashboard'
      ]);

      return;
    }

    this.router.navigate(['/']);
  }

  private redirectCurrentUser(): void {
    const user =
      this.auth.currentUser();

    if (user) {
      this.navigateAfterLogin(user);
    }
  }

  private canAccessReturnUrl(
    user: User,
    url: string
  ): boolean {
    if (
      url.startsWith('/booking') ||
      url.startsWith(
        '/my-reservations'
      )
    ) {
      return user.role === 'CLIENT';
    }

    if (
      url.startsWith('/dashboard')
    ) {
      return (
        user.role ===
        'PROFESSIONAL'
      );
    }

    return true;
  }
}
