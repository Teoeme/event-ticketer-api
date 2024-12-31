import { EntryType } from "../value-objects/EntryType";

export interface Entry {
  id: string;
  ticketId: string;  // Solo necesitamos ticketId
  date: Date;
  notes?: string;
  entryType: EntryType;
} 