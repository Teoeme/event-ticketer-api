import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Event } from '../../../domain/entities/Event';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { TicketTemplate } from '../../../domain/entities/TicketTemplate';
import { EventDTO } from '../../dtos/EventDTO';

export class CreateEventUseCase {
  private validationSchema:ValidationSchema<Event> = {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
      message: 'El nombre debe tener entre 3 y 100 caracteres'
    },
    description: {
      required: true,
      type: 'string',
      maxLength: 500
    },
    date: {
      required: true,
      type: 'date',
      custom: (value: Date) => value > new Date(),
      message: 'La fecha debe ser posterior a la actual'
    },
    startTime: {
      required: true,
      type: 'date',
      custom: (value: Date, data: Event) => {
        const now = new Date();
        const eventDate = new Date(data.date);
        const startDateTime = new Date(value);
        
        eventDate.setHours(startDateTime.getHours());
        eventDate.setMinutes(startDateTime.getMinutes());
        
        return eventDate > now;
      },
      message: 'La hora de inicio debe ser posterior a la actual'
    },
    endTime: {
      required: true,
      type: 'date',
      custom: (value: Date, data: Event) => {
        const startTime = new Date(data.startTime);
        const endTime = new Date(value);
        return endTime > startTime;
      },
      message: 'La hora de fin debe ser posterior a la hora de inicio'
    },
    location: {
      required: true,
      type: 'string'
    },
    capacity: {
      required: true,
      type: 'number',
      min: 1,
      message: 'La capacidad debe ser mayor a 0'
    },
    isActive: {
      type: 'boolean',
    },
    ticketTemplates: {
      type: 'array',
      required: false,
      minLength: 1,
      custom: (value: TicketTemplate[]) => {
        return !value.some(ticket => ticket.id===undefined);
    },
      message: 'Debe haber al menos un tipo de entrada'
    }
  };

  constructor(private eventRepository: IEventRepository,private ticketTemplateRepository: ITicketTemplateRepository) {}

  async execute(eventData: Omit<EventDTO, '_id'>): Promise<Event> {
    try {
      // Validar datos
      ValidationService.validate(eventData, this.validationSchema);

      const ticketTemplates = await Promise.all(eventData.ticketTemplates.map(async (ticketTemplate) => {
        const ticketTemplateData = await this.ticketTemplateRepository.findById(ticketTemplate);
        console.log(ticketTemplateData,'TICKET TEMPLATE DATA');
        if(!ticketTemplateData) throw new Error('Ticket template not found');
        return ticketTemplateData.id;
    }));

      // Crear evento
      const event = await this.eventRepository.create({...eventData,ticketTemplates});
      return event;
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw new Error(Object.values(error.errors).join(', '));
      }
      throw new Error(`Error al crear el evento: ${error.message}`);
    }
  }
} 