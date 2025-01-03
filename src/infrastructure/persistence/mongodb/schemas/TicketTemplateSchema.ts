import mongoose from "mongoose";
import { TicketTemplate } from "../../../../domain/entities/TicketTemplate";

const TicketTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    maxQuantity: { type: Number, required: true },
    clientMinAge: { type: Number, required: true },
    isActive: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TicketTemplateModel = mongoose.models.TicketTemplate || mongoose.model<TicketTemplate>('TicketTemplate', TicketTemplateSchema);

export default TicketTemplateModel;