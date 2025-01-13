import { ITicketRepository } from "../../../../domain/repositories/ITicketRepository";
import { Ticket } from "../../../../domain/entities/Ticket";
import { TicketStatus } from "../../../../domain/value-objects/TicketStatus";
import TicketModel from "../schemas/TicketSchema";

export class MongoTicketRepository implements ITicketRepository {
    async findById(id: string): Promise<Ticket | null> {
        return await TicketModel.findById(id);
    }

    async findByToken(token: string): Promise<Ticket | null> {
        return await TicketModel.findOne({ token });
    }

    async create(ticket: Omit<Ticket, 'id'> ): Promise<Ticket> {
        return await TicketModel.create(ticket);
    }

    async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
        const updatedTicket = await TicketModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedTicket) {
            throw new Error('No se encontró el ticket a actualizar');
        }
        return updatedTicket;
    }

    async delete(id: string): Promise<void> {
        const deletedTicket = await TicketModel.findByIdAndDelete(id);
        if (!deletedTicket) {
            throw new Error('No se encontró el ticket a eliminar');
        }
    }

    async findAll(): Promise<Ticket[]> {
        return await TicketModel.find();
    }

    async findByClientId(clientId: string): Promise<Ticket[]> {
        return await TicketModel.find({ clientId });
    }

    async findByEventId(eventId: string): Promise<Ticket[]> {
        return await TicketModel.find({ eventId });
    }

    async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
        const updatedTicket = await TicketModel.findByIdAndUpdate(id, ticket, { new: true });
        if (!updatedTicket) {
            throw new Error('No se encontró el ticket a actualizar');
        }
        return updatedTicket;
    }
}