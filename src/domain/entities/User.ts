import { UserRole } from '../value-objects/UserRole';
import { AuthProvider } from '../value-objects/AuthProvider';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  authProvider: AuthProvider;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 