import { Ticket } from "../../../domain/entities/Ticket";
import { IEventRepository } from "../../../domain/repositories/IEventRepository";
import { ITicketRepository } from "../../../domain/repositories/ITicketRepository";
import { TicketStatus } from "../../../domain/value-objects/TicketStatus";
import { EventTokenService } from "../../../infrastructure/services/token/EventTokenService";

export class ValidateTicketUseCase {
  constructor(
    private dependencies: {
      ticketRepository: ITicketRepository;
      eventRepository: IEventRepository;
    }
  ) {}

  async execute(token: string, eventId: string): Promise<{isValid:boolean,ticket:Ticket|null}> {
    try {
      // 1. Verificar si el ticket existe en la base de datos
      const ticket = await this.dependencies.ticketRepository.findByToken(token);
      if (!ticket) {
        return {isValid:false,ticket:null};
      }

      // 2. Obtener el evento y su secreto
      const event = await this.dependencies.eventRepository.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      // 3. Verificar la firma del token
      const tokenService = EventTokenService.getTokenService(event);
      const isValid = tokenService.verifyToken(token);

      // 4. Verificar que el ticket no haya sido usado
      if (ticket.status === TicketStatus.UTILIZADO) {
        throw new Error('El ticket ya ha sido utilizado');
      }

      return {isValid,ticket};
    } catch (error:any) {
      throw new Error(`Error al validar el ticket: ${error.message}`);
    }
  }
} 