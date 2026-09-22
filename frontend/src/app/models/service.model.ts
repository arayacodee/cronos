export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  businessId: string;
  name: string;
  description?: string;
  durationMin: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string | null;
  durationMin?: number;
  price?: number;
  isActive?: boolean;
}
