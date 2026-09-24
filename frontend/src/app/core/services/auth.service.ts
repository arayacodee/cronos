import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import {
  firstValueFrom,
  Observable,
  finalize,
  map,
  tap
} from 'rxjs';

import { ApiService } from './api.service';

import {
  User
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSignal =
    signal<User | null>(null);

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly isLoggedIn = computed(
    () => this.currentUserSignal() !== null
  );

  readonly isClient = computed(
    () =>
      this.currentUserSignal()?.role ===
      'CLIENT'
  );

  readonly isProfessional = computed(
    () =>
      this.currentUserSignal()?.role ===
      'PROFESSIONAL'
  );

  constructor(
    private readonly api: ApiService
  ) {}

  async initialize(): Promise<void> {
    try {
      const response =
        await firstValueFrom(
          this.api.getCurrentUser()
        );

      this.currentUserSignal.set(
        response.user
      );
    } catch {
      this.currentUserSignal.set(null);
    }
  }

  loginWithGoogle(
    credential: string
  ): Observable<User> {
    return this.api
      .googleLogin(credential)
      .pipe(
        tap((response) => {
          this.currentUserSignal.set(
            response.user
          );
        }),

        map((response) => response.user)
      );
  }

  logout(): Observable<void> {
    return this.api
      .logoutSession()
      .pipe(
        finalize(() => {
          this.currentUserSignal.set(null);
        })
      );
  }
}
