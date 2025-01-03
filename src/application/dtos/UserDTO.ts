import { UserRole } from '../../domain/value-objects/UserRole';
import { AuthProvider } from '../../domain/value-objects/AuthProvider';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  authProvider?: AuthProvider;
  isActive?: boolean;
}

export interface UserResponseDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  isActive: boolean;
  createdAt: Date;
} 