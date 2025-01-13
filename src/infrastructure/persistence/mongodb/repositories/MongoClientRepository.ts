import { Client } from "../../../../domain/entities/Client";
import { IClientRepository } from "../../../../domain/repositories/IClientRepository";
import ClientModel from "../schemas/ClientSchema";

export class MongoClientRepository implements IClientRepository {
    async findById(id: string): Promise<Client | null> {
        const client = await ClientModel.findById(id);
        if(!client){
            return null;
        }
        return this.mapToEntity(client);
    }
    async findByEmail(email: string): Promise<Client | null> {
        const client = await ClientModel.findOne({ email });
        if(!client){
            return null;
        }
        return this.mapToEntity(client);
    }
    async findByDocumentId(documentId: string): Promise<Client | null> {
        const client = await ClientModel.findOne({ documentId });
        if(!client){
            return null;
        }
        return this.mapToEntity(client);
    }
    async create(client: Omit<Client, "id" | "updatedAt" | "createdAt">): Promise<Client> {
        const newClient = await ClientModel.create(client);
        return this.mapToEntity(newClient);
    }
    async update(id: string, client: Partial<Client>): Promise<Client> {
        const updatedClient = await ClientModel.findByIdAndUpdate(id, client, { new: true });
        return this.mapToEntity(updatedClient);
    }
    async delete(id: string): Promise<void> {
        await ClientModel.findByIdAndDelete(id);
    }
    async list(): Promise<Client[]> {
        const clients = await ClientModel.find();
        return clients.map(this.mapToEntity);
    }

    private mapToEntity(client: any): Client {
        return {
            ...client.toObject(),
            id: client._id.toString(),
        };
    }
    
    private mapToModel(client: Client): any {
        return new ClientModel(client);
    }


}
