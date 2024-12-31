import { TicketStatus } from "../value-objects/TicketStatus";
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
} 