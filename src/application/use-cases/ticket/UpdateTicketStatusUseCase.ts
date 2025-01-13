import { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import { Ticket } from '../../../domain/entities/Ticket';
import { TicketStatus } from '../../../domain/value-objects/TicketStatus';
import { TicketEventType } from '../../../domain/value-objects/TicketEvent';
import { ValidationError } from '../../../domain/services/validation/ValidationService';
import { Entry } from '../../../domain/entities/Entry';

export class UpdateTicketStatusUseCase {
  private allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.PENDIENTE]: [TicketStatus.PAGADO, TicketStatus.ANULADO],
    [TicketStatus.PAGADO]: [TicketStatus.UTILIZADO, TicketStatus.ANULADO],
    [TicketStatus.UTILIZADO]: [TicketStatus.ANULADO],
    [TicketStatus.ANULADO]: [],
  };

  constructor(
    private dependencies: {
      ticketRepository: ITicketRepository;
    }
  ) {}

  async execute(
    {   ticketId, 
        newStatus, 
        userId,
        metadata,
        entry}:{ticketId:string,newStatus:TicketStatus,userId:string,metadata?:Record<string,any>,entry?:Entry}
  ): Promise<Ticket> {
    try {
      const ticket = await this.dependencies.ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      if (!this.isValidTransition(ticket.status, newStatus)) {
        throw new Error(`No se puede cambiar el estado de ${ticket.status} a ${newStatus}`);
      }

      const timestamp = new Date();
      const updateData: Partial<Ticket> = {
        status: newStatus,
      };

      // Crear evento de historial
      const historyEvent = {
        type: TicketEventType.CAMBIO_DE_ESTADO,
        timestamp,
        previousStatus: ticket.status,
        newStatus,
        userId,
        metadata: {}
      };

      // Agregar metadata específica según el nuevo estado
      switch (newStatus) {
        case TicketStatus.PAGADO:
          updateData.purchaseDate = timestamp;
          historyEvent.metadata = {
            purchaseDate: timestamp
          };
          break;

        case TicketStatus.UTILIZADO:
          updateData.entry = entry; //Datos del ingreso
          historyEvent.metadata = {
            entry
          };
          break;

        case TicketStatus.ANULADO:
          historyEvent.metadata = {
            cancellationReason: metadata?.reason || 'No especificado'
          };
          break;
      }

      // Agregar el nuevo evento al historial
      const updatedHistory = [...(ticket.history || []), historyEvent];
      updateData.history = updatedHistory;

      return await this.dependencies.ticketRepository.update(ticketId, updateData);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw new Error(Object.values(error.errors).join(', '));
      }
      throw new Error(`Error al actualizar el estado del ticket: ${error.message}`);
    }
  }

  private isValidTransition(currentStatus: TicketStatus, newStatus: TicketStatus): boolean {
    return this.allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }
} 