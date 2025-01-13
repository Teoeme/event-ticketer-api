import { connectDatabase } from './infrastructure/config/database';
import { env } from './infrastructure/config/env';
import { createServer } from './infrastructure/http/server';
import { MongoClientRepository } from './infrastructure/persistence/mongodb/repositories/MongoClientRepository';
import { MongoEventRepository } from './infrastructure/persistence/mongodb/repositories/MongoEventRepository';
import { MongoTicketRepository } from './infrastructure/persistence/mongodb/repositories/MongoTicketRepository';
import { MongoTicketTemplateRepository } from './infrastructure/persistence/mongodb/repositories/MongoTicketTemplate';
import { MongoTokenRepository } from './infrastructure/persistence/mongodb/repositories/MongoTokenRepository';
import { MongoUserRepository } from './infrastructure/persistence/mongodb/repositories/MongoUserRepository';
import { initializeDatabase } from './infrastructure/persistence/mongodb/seeds/initDb';
import { NodemailerService } from './infrastructure/services/email/NodemailerService';


const startServer = async () => {
  try {
    await connectDatabase();
    const userRepository = new MongoUserRepository(); 
    const emailService = new NodemailerService();
    const tokenRepository = new MongoTokenRepository();
    const eventRepository = new MongoEventRepository();
    const ticketTemplateRepository = new MongoTicketTemplateRepository();
    const ticketRepository = new MongoTicketRepository();
    const clientRepository = new MongoClientRepository();
    await initializeDatabase(userRepository);

    const app = createServer({ userRepository, emailService,tokenRepository ,eventRepository,ticketTemplateRepository,ticketRepository,clientRepository});

    const server = app.listen(env.port, () => {
      console.log('\x1b[32m%s\x1b[0m', ` Servidor corriendo en ${env.backendUrl}`);
      console.log('\x1b[36m%s\x1b[0m', `Documentación disponible en ${env.backendUrl}/api-docs`);
    });

    // Manejo de señales de terminación
    const shutdown = () => {
      server.close(() => {
        console.log('\x1b[31m%s\x1b[0m', 'Servidor apagado');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 