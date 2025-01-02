import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AuthProvider } from '../../domain/value-objects/AuthProvider';
import bcrypt from 'bcrypt';
import { env } from './env';
import { UserRole } from '../../domain/value-objects/UserRole';

export const configurePassport = (userRepository: IUserRepository) => {

    passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await userRepository.findByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: 'Credenciales inválidas' });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, {message: 'Credenciales inválidas'});
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: `${env.backendUrl}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userRepository.findByEmail(profile.emails![0].value);
          if (!user) {
            done(null, false);
            return
        }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.jwtSecret,
      },
      async (payload, done) => {
        try {
          const user = await userRepository.findById(payload.userId);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}; 