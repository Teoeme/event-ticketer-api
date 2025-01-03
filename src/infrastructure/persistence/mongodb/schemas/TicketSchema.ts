import mongoose from "mongoose";
import { Ticket } from "../../../../domain/entities/Ticket";
import { TicketStatus } from "../../../../domain/value-objects/TicketStatus";

const TicketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    templateId: { type: String, required: true },
    eventId: { type: String, required: true, ref: 'Event' },
    clientId: { type: String, required: true, ref: 'Client' },
    token: { type: String, required: true },
    price: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    issueDate: { type: Date, required: true },
    status: { type: String, required: true, enum: Object.values(TicketStatus), default: TicketStatus.PENDIENTE },
    entry: { type: String, required: false, default: null , ref: 'Entry'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TicketModel = mongoose.models.Ticket || mongoose.model<Ticket>('Ticket', TicketSchema);

export default TicketModel;