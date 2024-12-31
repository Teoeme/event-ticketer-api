import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class DeleteUserUseCase {
  constructor(private dependencies: { userRepository: IUserRepository }) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this.dependencies.userRepository.findById(id);
    
    if (!existingUser) {
      throw new Error('Usuario no encontrado, no se puede eliminar');
    }

    await this.dependencies.userRepository.delete(id);
  }
} 