import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import bcrypt from 'bcrypt';


export class UpdateUserUseCase {
  constructor(private dependencies: { userRepository: IUserRepository }) {}

  async execute(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = await this.dependencies.userRepository.findById(id);
    
    if (!existingUser) {
      throw new Error('Usuario no encontrado, no se puede actualizar');
    }

    if(userData.password){
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = {
      ...userData,
      updatedAt: new Date()
    };

    return this.dependencies.userRepository.update(id, updatedUser);
  }
} 