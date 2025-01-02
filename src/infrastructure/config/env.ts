import dotenv from 'dotenv';

dotenv.config({ path: `${process.env.NODE_ENV === 'production' ? '.env.production.local' : '.env'}` });

export const env = {
  appName: process.env.APP_NAME || 'My-App',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DB_NAME || 'event-ticketer-app',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: process.env.SMTP_PORT || '',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  smtpSecure: process.env.SMTP_SECURE ==='false' ? false : true,
  recoverPasswordTokenExpiration: process.env.RECOVER_PASSWORD_TOKEN_EXPIRATION || '1h',
}; 