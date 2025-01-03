import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { TicketTemplate } from '../../../domain/entities/TicketTemplate';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';

export class UpdateTicketTemplateUseCase {
  private validationSchema:ValidationSchema<TicketTemplate> = {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 50
    },
    description: {
      type: 'string',
      maxLength: 200
    },
    price: {
      type: 'number',
      min: 0
    },
    maxQuantity: {
      type: 'number',
      min: 1
    }
  };

  constructor(private ticketTemplateRepository: ITicketTemplateRepository) {}

  async execute(template: TicketTemplate): Promise<TicketTemplate> {
    try {
      ValidationService.validate(template, this.validationSchema);
      return await this.ticketTemplateRepository.update(template);
    } catch (error:any) {
        if (error instanceof ValidationError) {
            throw new Error(Object.values(error.errors).join(', '));
          }
      throw new Error(`Error al actualizar la plantilla de ticket: ${error.message}`);
    }
  }
} 