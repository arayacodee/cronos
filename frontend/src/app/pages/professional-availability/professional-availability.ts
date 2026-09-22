import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Business } from '../../models/business.model';
import { AuthService } from '../../core/services/auth.service';
import {
  Availability,
  CreateAvailabilityRequest
} from '../../models/availability.model';

@Component({
  selector: 'app-professional-availability',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './professional-availability.html',
  styleUrl: './professional-availability.css'
})
export class ProfessionalAvailability implements OnInit {
  business = signal<Business | null>(null);
  availabilities = signal<Availability[]>([]);

  loading = signal(true);
  saving = signal(false);
  deletingId = signal<string | null>(null);

  errorMessage = signal('');
  successMessage = signal('');

  newAvailability = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00'
  };

  readonly days = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const professional = this.auth.currentUser();

    if (
      !professional ||
      professional.role !== 'PROFESSIONAL'
    ) {
      this.errorMessage.set(
        'Debes ingresar como profesional.'
      );

      this.loading.set(false);
      return;
    }

    this.api.getBusinesses().subscribe({
      next: (businesses) => {
        const business = businesses.find(
          (item) => item.ownerId === professional.id
        );

        if (!business) {
          this.errorMessage.set(
            'El profesional no tiene un negocio.'
          );

          this.loading.set(false);
          return;
        }

        this.business.set(business);

        this.loadAvailabilities(business.id);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          'No fue posible cargar los datos.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadAvailabilities(businessId: string): void {
    this.api
      .getAvailabilitiesByBusiness(businessId)
      .subscribe({
        next: (availabilities) => {
          this.availabilities.set(
            this.sortAvailabilities(availabilities)
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error(error);

          this.errorMessage.set(
            'No fue posible cargar la disponibilidad.'
          );

          this.loading.set(false);
        }
      });
  }

  createAvailability(): void {
    const business = this.business();

    if (!business) {
      return;
    }

    if (
      !this.newAvailability.startTime ||
      !this.newAvailability.endTime
    ) {
      this.errorMessage.set(
        'Debes indicar una hora de inicio y término.'
      );

      return;
    }

    if (
      this.newAvailability.startTime >=
      this.newAvailability.endTime
    ) {
      this.errorMessage.set(
        'La hora de término debe ser posterior a la hora de inicio.'
      );

      return;
    }

    const data: CreateAvailabilityRequest = {
      businessId: business.id,
      dayOfWeek: Number(this.newAvailability.dayOfWeek),
      startTime: this.newAvailability.startTime,
      endTime: this.newAvailability.endTime,
      isActive: true
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.createAvailability(data).subscribe({
      next: (availability) => {
        this.availabilities.update((current) =>
          this.sortAvailabilities([
            ...current,
            availability
          ])
        );

        this.successMessage.set(
          'Disponibilidad agregada correctamente.'
        );

        this.saving.set(false);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          error?.error?.error ??
            'No fue posible agregar la disponibilidad.'
        );

        this.saving.set(false);
      }
    });
  }

  deleteAvailability(availability: Availability): void {
    this.deletingId.set(availability.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.deleteAvailability(
      availability.id
    ).subscribe({
      next: () => {
        this.availabilities.update((current) =>
          current.filter(
            (item) => item.id !== availability.id
          )
        );

        this.successMessage.set(
          'Disponibilidad eliminada correctamente.'
        );

        this.deletingId.set(null);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          error?.error?.error ??
            'No fue posible eliminar la disponibilidad.'
        );

        this.deletingId.set(null);
      }
    });
  }

  dayName(dayOfWeek: number): string {
    return (
      this.days.find(
        (day) => day.value === dayOfWeek
      )?.label ?? 'Día'
    );
  }

  private sortAvailabilities(
    availabilities: Availability[]
  ): Availability[] {
    return [...availabilities].sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        a.startTime.localeCompare(b.startTime)
    );
  }
}
