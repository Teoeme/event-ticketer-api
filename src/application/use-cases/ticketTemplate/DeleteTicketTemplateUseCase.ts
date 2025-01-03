import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';

export class DeleteTicketTemplateUseCase {
  constructor(private ticketTemplateRepository: ITicketTemplateRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.ticketTemplateRepository.delete(id);
    } catch (error:any) {
      throw new Error(`Error al eliminar la plantilla de ticket: ${error.message}`);
    }
  }
} 