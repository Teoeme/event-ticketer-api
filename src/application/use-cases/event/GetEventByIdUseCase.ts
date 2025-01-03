import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Event } from '../../../domain/entities/Event';

export class GetEventByIdUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(id: string): Promise<Event | null> {
    try {
      const event = await this.eventRepository.findById(id);
      return event;
    } catch (error: any) {
      throw new Error(`Error al obtener el evento: ${error.message}`);
    }
  }
} 