import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthProvider } from '../../../domain/value-objects/AuthProvider';
import { CreateUserDTO } from '../../dtos/UserDTO';
import bcrypt from 'bcrypt';
export class CreateUserUseCase {
  constructor(private dependencies: { userRepository: IUserRepository }) {}

  async execute(userData: CreateUserDTO): Promise<User> {
    const existingUser = await this.dependencies.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    const user: Omit<User, '_id'> = {
        authProvider:AuthProvider.LOCAL,
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    
    if(!user.password && user.authProvider === AuthProvider.LOCAL){
        throw new Error('La contraseña es requerida');
    }

    if(userData.password){
      user.password = await bcrypt.hash(userData.password, 10);
    }

    return this.dependencies.userRepository.create(user);
  }
} 