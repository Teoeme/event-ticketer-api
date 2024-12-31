
import { Event } from '../entities/Event';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  create(event: Omit<Event, 'id'>): Promise<Event>;
  update(id: string, event: Partial<Event>): Promise<Event>;
  delete(id: string): Promise<void>;
  list(): Promise<Event[]>;
  findActiveEvents(): Promise<Event[]>;
} 