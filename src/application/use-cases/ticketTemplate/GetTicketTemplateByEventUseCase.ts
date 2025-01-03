import { TicketTemplate } from '../../../domain/entities/TicketTemplate';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';

export class GetTicketTemplateByEventUseCase {
  constructor(private ticketTemplateRepository: ITicketTemplateRepository) {}

  async execute(eventId: string): Promise<TicketTemplate[] | null> {
    try {
      return await this.ticketTemplateRepository.findByEventId(eventId);
    } catch (error:any) {
       
      throw new Error(`Error al obtener la plantilla de ticket: ${error.message}`);
    }
  }
} 