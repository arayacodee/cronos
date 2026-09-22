export interface Availability {
  id: string;
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityRequest {
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}


// El backend calcula los horarios realmente reservables.
// Angular solo recibe horas libres y no datos de otras reservas.
export interface AvailableSlotsResponse {
  date: string;
  timezone: string;
  slots: string[];
}
