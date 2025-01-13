import { TicketStatus } from "../value-objects/TicketStatus";
import { TicketEvent } from "../value-objects/TicketEvent";
import { Entry } from "./Entry";

export interface Ticket {
  id: string;
  templateId: string;  // Eliminar eventId ya que viene en template
  clientId: string;
  token: string;
  price: number;
  purchaseDate: Date;
  issueDate: Date;
  status: TicketStatus;
  entry?: Entry;  // Relación opcional con entrada
  eventId: string;
  history: TicketEvent[]; // Nuevo campo para el historial
} 