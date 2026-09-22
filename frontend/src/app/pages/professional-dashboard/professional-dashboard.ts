import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../models/user.model';
import { Business } from '../../models/business.model';
import { Service } from '../../models/service.model';
import { Availability } from '../../models/availability.model';
import { Reservation } from '../../models/reservation.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-professional-dashboard',
  imports: [RouterLink],
  templateUrl: './professional-dashboard.html',
  styleUrl: './professional-dashboard.css'
})
export class ProfessionalDashboard implements OnInit {
  professional = signal<User | null>(null);
  business = signal<Business | null>(null);

  services = signal<Service[]>([]);
  availabilities = signal<Availability[]>([]);
  reservations = signal<Reservation[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }


  private loadDashboard(): void {
    const professional =
      this.auth.currentUser();

    if (
      !professional ||
      professional.role !== 'PROFESSIONAL'
    ) {
      this.router.navigate(['/login']);
      return;
    }

    this.professional.set(
      professional
    );

    // El endpoint /me obtiene el perfil asociado
    // directamente al profesional autenticado.
    this.api.getMyBusiness().subscribe({
      next: (business) => {
        this.business.set(
          business
        );

        this.loadBusinessData(
          business.id
        );
      },

      error: (error) => {
        if (error.status === 404) {
          this.router.navigate([
            '/professional/setup'
          ]);

          return;
        }

        console.error(error);

        this.errorMessage.set(
          'No fue posible cargar el dashboard.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadBusinessData(businessId: string): void {
    forkJoin({
      services: this.api.getServicesByBusiness(businessId),

      availabilities:
        this.api.getAvailabilitiesByBusiness(businessId),

      reservations:
        this.api.getReservationsByBusiness(businessId)
    }).subscribe({
      next: ({
        services,
        availabilities,
        reservations
      }) => {
        this.services.set(services);

        this.availabilities.set(
          [...availabilities].sort(
            (a, b) =>
              a.dayOfWeek - b.dayOfWeek ||
              a.startTime.localeCompare(b.startTime)
          )
        );

        this.reservations.set(
          [...reservations].sort(
            (a, b) =>
              new Date(a.startsAt).getTime() -
              new Date(b.startsAt).getTime()
          )
        );

        this.loading.set(false);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          'No fue posible cargar los datos del negocio.'
        );

        this.loading.set(false);
      }
    });
  }

  activeServicesCount(): number {
    return this.services().filter(
      (service) => service.isActive
    ).length;
  }

  confirmedReservationsCount(): number {
    return this.reservations().filter(
      (reservation) =>
        reservation.status === 'CONFIRMED'
    ).length;
  }

  upcomingReservations(): Reservation[] {
    const now = new Date();

    return this.reservations().filter(
      (reservation) =>
        reservation.status !== 'CANCELLED' &&
        new Date(reservation.startsAt) >= now
    );
  }

  dayName(day: number): string {
    const days: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo'
    };

    return days[day] ?? 'Día';
  }

  formatDate(value: string): string {
    const business = this.business();

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeZone: business?.timezone
    }).format(new Date(value));
  }

  formatTime(value: string): string {
    const business = this.business();

    return new Intl.DateTimeFormat('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: business?.timezone
    }).format(new Date(value));
  }

  formatPrice(price: string | number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(price));
  }
}
