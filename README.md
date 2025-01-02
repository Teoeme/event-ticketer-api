# event-ticketer-api


## Instalación

1. Clonar el repositorio
2. Ejecutar `npm install`
3. Configurar el archivo `.env` con las variables de entorno necesarias, puedes usar el archivo `.env.template` como referencia
4. Ejecutar `npm run dev` para iniciar el servidor en modo de desarrollo

## Configuración de nodemailer

Para el servicio de recuperacion de contraseña de los usuarios, debe proveer un servicio de email mediante las credenciales en el archivo `.env`.
Envíe una solicitud a la ruta `/users/recover-password/{userEmail}` para enviar un email de recuperacion de contraseña al usuario.
Si se hace una solicitud de recuperacion de contraseña, se enviara un email al usuario con un enlace para restablecer su contraseña. 
Este enlace contiene un token de autenticación que se puede usar para restablecer la contraseña del usuario.
El enlace dirige a la ruta `/reset-password` en el frontend, donde se puede restablecer la contraseña del usuario.
Asegurese de que el frontend provea la ruta `/reset-password` y utilice el token enviado por parametro en la url para restablecer la contraseña del usuario. La validez predeterminada del token es de 1 hora, aunque puede modificarla en el `.env`.