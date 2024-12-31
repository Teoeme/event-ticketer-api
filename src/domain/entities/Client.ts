export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  documentId: string;
  birthDate: Date;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 