import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Event } from '../../../domain/entities/Event';

export class ListEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<Event[]> {
    try {
      const events = await this.eventRepository.list();
      return events;
    } catch (error: any) {
      throw new Error(`Error al listar los eventos: ${error.message}`);
    }
  }
} 