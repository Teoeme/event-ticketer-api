import mongoose from "mongoose";
import { Client } from "../../../../domain/entities/Client";

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    documentId: { type: String, required: true },
    birthDate: { type: Date, required: true },
    socialMedia: { type: Object, required: false },
},{timestamps:true});
ClientSchema.index({ documentId: 1 }, { unique: true });

const ClientModel = mongoose.models.Client || mongoose.model<Client>('Client', ClientSchema);

export default ClientModel;
