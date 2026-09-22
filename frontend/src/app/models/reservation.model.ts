import { Business } from './business.model';
import { Service } from './service.model';
import { User } from './user.model';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED';

export interface Reservation {
  id: string;
  businessId: string;
  serviceId: string;
  clientId: string;

  startsAt: string;
  endsAt: string;
  status: ReservationStatus;

  createdAt: string;
  updatedAt: string;

  business?: Business;
  service?: Service;
  client?: User;
}

export interface CreateReservationRequest {
  serviceId: string;
  startsAt: string;
}
