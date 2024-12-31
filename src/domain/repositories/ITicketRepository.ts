import { Ticket } from '../entities/Ticket';
import { TicketStatus } from '../value-objects/TicketStatus';

export interface ITicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByToken(token: string): Promise<Ticket | null>;
  create(ticket: Omit<Ticket, 'id'>): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus): Promise<Ticket>;
  findByClientId(clientId: string): Promise<Ticket[]>;
  findByTemplateId(templateId: string): Promise<Ticket[]>;
} 