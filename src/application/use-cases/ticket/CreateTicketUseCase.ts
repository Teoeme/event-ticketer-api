import { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import { ITicketTemplateRepository } from '../../../domain/repositories/ITicketTemplateRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { Ticket } from '../../../domain/entities/Ticket';
import { ValidationError, ValidationSchema, ValidationService } from '../../../domain/services/validation/ValidationService';
import { TicketStatus } from '../../../domain/value-objects/TicketStatus';
import { CreateTicketDTO } from '../../dtos/TicketDTO';
import { EventTokenService } from '../../../infrastructure/services/token/EventTokenService';
import { TicketEventType } from '../../../domain/value-objects/TicketEvent';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';

export class CreateTicketUseCase {
  private validationSchema:ValidationSchema<CreateTicketDTO> = {
    templateId: {
      required: true,
      type: 'string'
    },
    client: {
      required: true,
      type: 'object',
      custom: (value, object) => {
        if(!value.id && !value.dni) {
          return 'Especifique un id de cliente o el dni';
        }
        return true;
      }
    },
    eventId: {
      required: true,
      type: 'string'
    },
  };

  constructor(
    private dependencies: {
      ticketRepository: ITicketRepository;
      ticketTemplateRepository: ITicketTemplateRepository;
      eventRepository: IEventRepository;
      clientRepository: IClientRepository;
    }
  ) {}

  async execute(ticketData: CreateTicketDTO, userId: string): Promise<Ticket> {
    try {
      // Validar datos básicos
      ValidationService.validate(ticketData, this.validationSchema);


      //Buscar cliente por dni
      if(!ticketData.client.id){
        const client = await this.dependencies.clientRepository.findByDocumentId(ticketData.client.dni!);
        if(!client){
          //creamos el cliente
          if(!ticketData.client.name){
            throw new Error('El nombre del cliente es requerido');
          }
          if(!ticketData.client.dni){
            throw new Error('El dni del cliente es requerido');
          }

          const newClient = await this.dependencies.clientRepository.create({
            documentId: ticketData.client.dni!,
            name: ticketData.client.name!,
            email: ticketData.client.email || '',
            phone: ticketData.client.phone || '',
            birthDate: new Date()
          });
          ticketData.client.id = newClient.id;
        }else{
          ticketData.client.id=client.id
        }
      } 


      // Verificar que el template existe y tiene disponibilidad
      const template = await this.dependencies.ticketTemplateRepository.findById(ticketData.templateId);
      if (!template) {
        throw new Error('La plantilla de ticket no existe');
      }

      // Verificar que el evento existe y está activo
      const event = await this.dependencies.eventRepository.findById(ticketData.eventId);
      if (!event) {
        throw new Error('El evento no existe');
      }
      if (!event.isActive) {
        throw new Error('El evento no está activo');
      }

      // Verificar que el evento no ha pasado
      if (new Date(event.date) < new Date()) {
        throw new Error('El evento ya ha pasado');
      }


      //TODO agregar validacion del cliente
      
      const tokenService = EventTokenService.getTokenService(event);
      const token = tokenService.generateTicketToken({
        eventId: ticketData.eventId,
        templateId: ticketData.templateId,
        clientId: ticketData.client.id,
        timestamp: Date.now()
      });

      const timestamp = new Date();
      const ticket: Omit<Ticket, 'id'> = {
        templateId: ticketData.templateId,
        clientId: ticketData.client.id,
        eventId: ticketData.eventId,
        token, 
        price: template.price,
        purchaseDate: timestamp,
        issueDate: timestamp,
        status: TicketStatus.PENDIENTE,
        entry: undefined,
        history: [{
          type: TicketEventType.CREADO,
          timestamp,
          userId,
          newStatus: TicketStatus.PENDIENTE,
          metadata: {
            templateId: ticketData.templateId,
            eventId: ticketData.eventId,
            price: template.price
          }
        }]
      };

      return await this.dependencies.ticketRepository.create(ticket);
    } catch (error: any) {
        if(error instanceof ValidationError) {
        throw new Error(Object.values(error.errors).join(', '));
        }
        throw new Error(`Error al crear el ticket: ${error.message}`);
    }
  }
} 