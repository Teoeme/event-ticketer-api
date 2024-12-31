import mongoose from 'mongoose';
import { User } from '../../../../domain/entities/User';
import { UserRole } from '../../../../domain/value-objects/UserRole';
import { AuthProvider } from '../../../../domain/value-objects/AuthProvider';

const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    required: true 
  },
  authProvider: { 
    type: String, 
    enum: Object.values(AuthProvider),
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const UserModel =  mongoose.models.User || mongoose.model<User>('User', userSchema);
