import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Event } from '../../../domain/entities/Event';

export class ListActiveEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<Event[]> {
    try {
      const events = await this.eventRepository.findActiveEvents();
      return events;
    } catch (error: any) {
      throw new Error(`Error al listar los eventos activos: ${error.message}`);
    }
  }
} 