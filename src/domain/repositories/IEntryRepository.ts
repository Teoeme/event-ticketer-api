import { Entry } from '../entities/Entry';

export interface IEntryRepository {
  findById(id: string): Promise<Entry | null>;
  create(entry: Omit<Entry, 'id'>): Promise<Entry>;
  findByTicketId(ticketId: string): Promise<Entry[]>;
  findByEventId(eventId: string): Promise<Entry[]>;
} 