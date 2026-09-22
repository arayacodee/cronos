export type UserRole =
  | 'CLIENT'
  | 'PROFESSIONAL';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
}
