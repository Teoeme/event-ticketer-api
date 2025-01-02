export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
} 