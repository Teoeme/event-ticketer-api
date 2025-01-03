import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { TicketTemplate } from '../../../domain/entities/TicketTemplate';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';

export class CreateTicketTemplateUseCase {
  private validationSchema: ValidationSchema<TicketTemplate> = {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 50,
      message: 'El nombre debe tener entre 3 y 50 caracteres'
    },
    description: {
      type: 'string',
      maxLength: 200
    },
    price: {
      required: true,
      type: 'number',
      min: 0,
      message: 'El precio no puede ser negativo'
    },
    maxQuantity: {
      required: true,
      type: 'number',
      min: 1,
      message: 'La cantidad debe ser mayor a 0'
    },
    clientMinAge: {
      required:true,
      type: 'number',
      min: 0,
      message: 'La edad mínima del cliente no puede ser negativa'
    }
  };

  constructor(private ticketTemplateRepository: ITicketTemplateRepository) {}

  async execute(templateData: TicketTemplate): Promise<TicketTemplate> {
    try {
      ValidationService.validate(templateData, this.validationSchema);
      return await this.ticketTemplateRepository.create({...templateData,
        isActive: templateData.isActive ?? true,

    });
    } catch (error:any) {
        if (error instanceof ValidationError) {
            throw new Error(Object.values(error.errors).join(', '));
          }
      throw new Error(`Error al crear la plantilla de ticket: ${error.message}`);
    }
  }
} 