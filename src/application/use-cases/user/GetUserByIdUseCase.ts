import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class GetUserByIdUseCase {
  constructor(private dependencies: { userRepository: IUserRepository }) {}

  async execute(id: string): Promise<User> {
    const user = await this.dependencies.userRepository.findById(id);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }
} 