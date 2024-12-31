import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { User as UserEntity } from '../../../domain/entities/User';

// Extender la interfaz Request de Express
declare global {
  namespace Express {
    interface User extends Omit<UserEntity, 'password'> {}
  }
}

export const authenticate = passport.authenticate('jwt', { session: false });

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction):void => {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
      return;
    }

    next();
  };
}; 