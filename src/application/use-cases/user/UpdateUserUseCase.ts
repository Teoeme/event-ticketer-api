import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class UpdateUserUseCase {
  constructor(private dependencies: { userRepository: IUserRepository }) {}

  async execute(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = await this.dependencies.userRepository.findById(id);
    
    if (!existingUser) {
      throw new Error('Usuario no encontrado, no se puede actualizar');
    }

    const updatedUser = {
      ...userData,
      updatedAt: new Date()
    };

    return this.dependencies.userRepository.update(id, updatedUser);
  }
} 