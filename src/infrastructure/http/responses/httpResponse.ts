import { Response } from 'express';

interface HttpResponse {
  statusCode: number;
  ok: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export const sendResponse = (res: Response, { statusCode, message, data, error }: HttpResponse): Response => {
  const response: Record<string, any> = {
    ok: statusCode >= 200 && statusCode < 300,
  };

  if (message) response.message = message;
  if (data) response.data = data;
  if (error) response.error = error;

  return res.status(statusCode).json(response);
};

// Helpers para casos comunes
export const httpResponses = {
  ok: (res: Response, data?: any, message?: string) => 
    sendResponse(res, { statusCode: 200, data, message ,ok:true}),

  created: (res: Response, data?: any, message?: string) => 
    sendResponse(res, { statusCode: 201, data, message ,ok:true}),

  badRequest: (res: Response, message?: string) => 
    sendResponse(res, { statusCode: 400, error: message || 'Bad Request',ok:false }),

  unauthorized: (res: Response, message?: string) => 
    sendResponse(res, { statusCode: 401, error: message || 'Permisos insuficientes',ok:false }),

  forbidden: (res: Response, message?: string) => 
    sendResponse(res, { statusCode: 403, error: message || 'Acceso denegado',ok:false }),

  notFound: (res: Response, message?: string) => 
    sendResponse(res, { statusCode: 404, error: message || 'Not Found',ok:false }),

  serverError: (res: Response, error?: any) => 
    sendResponse(res, { 
      statusCode: 500, 
      error: 'Error del servidor',
      message: error?.message ,
      ok:false
    }),
}; 