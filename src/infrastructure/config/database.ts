import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(`${env.mongoUri}`,
      {
        dbName: env.mongoDbName,
      }
    );
    console.log('\x1b[32m%s\x1b[0m', 'Conectado a MongoDB');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('\x1b[31m%s\x1b[0m', 'Desconectado de MongoDB');
    }; 

export const cleanDatabase = async (): Promise<void> => {
  const collections = await mongoose.connection.db?.collections();
  if (collections && collections.length > 0) {
    await Promise.all(collections.map(async (collection) => {  
      await collection.deleteMany({});
    }));
  }
  console.log('\x1b[32m%s\x1b[0m', 'Base de datos limpia');
};