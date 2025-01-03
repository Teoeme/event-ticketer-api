import { TicketTemplate } from "../entities/TicketTemplate";

export interface ITicketTemplateRepository {
    findById(id: string): Promise<TicketTemplate | null>;
    findByEventId(eventId: string): Promise<TicketTemplate[] | null>;
    create(ticketTemplate: TicketTemplate): Promise<TicketTemplate>;
    update(ticketTemplate: TicketTemplate): Promise<TicketTemplate>;
    delete(id: string): Promise<void>;
}