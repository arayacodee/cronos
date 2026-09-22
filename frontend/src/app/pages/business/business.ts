import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/services/api.service';
import { Business as BusinessModel } from '../../models/business.model';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-business',
  imports: [RouterLink],
  templateUrl: './business.html',
  styleUrl: './business.css'
})
export class Business implements OnInit {
  business = signal<BusinessModel | null>(null);
  services = signal<Service[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    const businessId = this.route.snapshot.paramMap.get('id');

    if (!businessId) {
      this.errorMessage.set('Negocio no válido.');
      this.loading.set(false);
      return;
    }

    this.api.getBusinessById(businessId).subscribe({
      next: (business) => {
        this.business.set(business);

        this.api.getServicesByBusiness(businessId).subscribe({
          next: (services) => {
            this.services.set(
              services.filter((service) => service.isActive)
            );

            this.loading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.errorMessage.set(
              'No fue posible cargar los servicios.'
            );

            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(
          'No fue posible cargar el negocio.'
        );

        this.loading.set(false);
      }
    });
  }
}
