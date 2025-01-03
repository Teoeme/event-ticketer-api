import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Event } from '../../../domain/entities/Event';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { EventDTO } from '../../dtos/EventDTO';
import { TicketTemplateDTO } from '../../dtos/TicketTemplateDTO';

export class UpdateEventUseCase {
    private validationSchema: ValidationSchema<Partial<EventDTO>> = {
        name: {
            type: "string",
            minLength: 3,
            maxLength: 100,
            message: 'El nombre del evento debe tener entre 3 y 100 caracteres'
        },
        description: {
            type: "string",
            maxLength: 500,
            message: 'La descripción no puede exceder los 500 caracteres'
        },
        date: {
            type: "date",
            custom: (value: Date) => value > new Date(),
            message: 'La fecha debe ser posterior a la actual'
        },
        capacity: {
            type: "number",
            min: 1,
            message: 'La capacidad debe ser mayor a 0',
        },
        isActive: {
            type: "boolean",
            message: 'El estado del evento debe ser booleano'
        },
        ticketTemplates: {
            type: "array",
            custom: (value: string[]) => value.every((ticketTemplate) => typeof ticketTemplate === 'string'),
            message: 'Los templates de tickets deben ser un array de strings',
        }
    }

    constructor(private eventRepository: IEventRepository, private ticketTemplateRepository: ITicketTemplateRepository) {

    }

    async execute(id: string, eventData: Partial<EventDTO>): Promise<Event> {
        try {
            ValidationService.validate(eventData, this.validationSchema);

                const ticketTemplates = await Promise.all((eventData?.ticketTemplates || [])?.map(async (ticketTemplate) => {
                    const ticketTemplateData = await this.ticketTemplateRepository.findById(ticketTemplate);
                    if (!ticketTemplateData) throw new Error('No se encontró la plantilla de ticket');
                    return ticketTemplateData.id
                })) || []

            const event = await this.eventRepository.update(id, {...eventData, ticketTemplates});
            return event;
        } catch (error: any) {
            if (error instanceof ValidationError) {
                throw new Error(`Error al actualizar el evento: ${Object.values(error.errors).join(', ')}`);
            }
            throw new Error(`Error al actualizar el evento: ${error.message}`);
        }
    }
} 