export interface BusinessOwner {
  id: string;
  email: string;
  name: string | null;
  role: 'CLIENT' | 'PROFESSIONAL';
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  coverUrl: string | null;
  coverPublicId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: BusinessOwner;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  description?: string | null;
}
