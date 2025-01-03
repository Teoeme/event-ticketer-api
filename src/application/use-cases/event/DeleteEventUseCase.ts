import { IEventRepository } from '../../../domain/repositories/IEventRepository';

export class DeleteEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.eventRepository.delete(id);
    } catch (error: any) {
      throw new Error(`Error al eliminar el evento: ${error.message}`);
    }
  }
} 