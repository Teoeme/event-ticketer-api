import { Entry } from "../../domain/entities/Entry";
import { TicketStatus } from "../../domain/value-objects/TicketStatus";

export interface CreateTicketDTO {
    templateId: string;
    client: {
        id?: string;
        dni?: string;
        name?: string;
        email?: string;
        phone?: string;
    };
    issueDate: Date;
    purchaseDate?: Date;
    status: TicketStatus; 
    price?: number;
    eventId: string;
    entry?: string; // id del ingreso
}