import { connectDatabase } from './infrastructure/config/database';
import { env } from './infrastructure/config/env';
import { createServer } from './infrastructure/http/server';
import { MongoUserRepository } from './infrastructure/persistence/mongodb/repositories/MongoUserRepository';
import { initializeDatabase } from './infrastructure/persistence/mongodb/seeds/initDb';


const startServer = async () => {
  try {
    await connectDatabase();
    const userRepository = new MongoUserRepository(); 

    // Inicializar la base de datos con datos de prueba
    await initializeDatabase(userRepository);

    const app = createServer({ userRepository });

    const server = app.listen(env.port, () => {
      console.log('\x1b[32m%s\x1b[0m', ` Servidor corriendo en ${env.apiUrl}`);
      console.log('\x1b[36m%s\x1b[0m', `Documentación disponible en http://localhost:${env.port}/api-docs`);
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