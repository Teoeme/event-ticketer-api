
import { EventDTO } from '../../application/dtos/EventDTO';
import { Event } from '../entities/Event';
export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  create(event: Omit<EventDTO, "_id">): Promise<Event>;
  update(id: string, event: Partial<EventDTO>): Promise<Event>;
  delete(id: string): Promise<void>;
  list(): Promise<Event[]>;
  findActiveEvents(): Promise<Event[]>;
} 