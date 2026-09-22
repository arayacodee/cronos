import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/services/api.service';
import { Business } from '../../models/business.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  businesses = signal<Business[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getBusinesses().subscribe({
      next: (businesses) => {
        this.businesses.set(businesses);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        this.errorMessage.set('No fue posible cargar los negocios.');
        this.loading.set(false);
      }
    });
  }
}
