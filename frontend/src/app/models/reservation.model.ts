import { Business } from './business.model';
import { Service } from './service.model';
import { User } from './user.model';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
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

export interface ClientSession {
  id: string;
  businessId: string;
  clientId: string;
  reservationId: string;
  occurredAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteReservationResponse {
  reservation: Reservation;
  session: ClientSession;
}
