import { env } from "../../../config/env";

export const createPasswordRecoveryEmailTemplate = (
  userName: string,
  resetLink: string,
  expirationTime: string = '24 horas'
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Recuperación de Contraseña</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="margin-bottom: 15px;">Hola ${userName},</p>
          
          <p style="margin-bottom: 15px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
          Si no has solicitado este cambio, puedes ignorar este correo y tu contraseña 
          permanecerá sin cambios.</p>

          <p style="margin-bottom: 15px;">Si has sido tú quien solicitó el cambio, puedes restablecer tu contraseña 
          haciendo clic en el siguiente botón:</p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #007bff; 
                      color: white; text-decoration: none; border-radius: 5px; 
                      font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>

          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; 
                      border-radius: 5px; margin: 20px 0;">
            <strong style="display: block; margin-bottom: 10px;">¡Importante!</strong>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 5px;">Este enlace expirará en ${expirationTime}</li>
              <li style="margin-bottom: 5px;">Si no solicitaste este cambio, recomendamos que cambies tu contraseña 
              por seguridad</li>
              <li style="margin-bottom: 5px;">No compartas este enlace con nadie</li>
            </ul>
          </div>

          <p style="margin-bottom: 10px;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu 
          navegador:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; 
                    border-radius: 4px; font-family: monospace; font-size: 12px;">
            ${resetLink}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${env.appName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 