import { Client } from '../entities/Client';

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findByDocumentId(documentId: string): Promise<Client | null>;
  create(client: Omit<Client, 'id' | 'updatedAt' | 'createdAt'>): Promise<Client>;
  update(id: string, client: Partial<Client>): Promise<Client>;
  delete(id: string): Promise<void>;
  list(): Promise<Client[]>;
} 