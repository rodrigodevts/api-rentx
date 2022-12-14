import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../errors/AppError';
import { UsersTokensRepository } from '../../../../modules/accounts/infra/typeorm/repositories/UsersTokensRepository';
import auth from '../../../../config/auth';

interface IPayload {
  sub: string;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;
  const usersTokensRepository = new UsersTokensRepository();

  if (!authHeader) {
    throw new AppError('Token missing', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const { sub: user_id } = verify(token, auth.secret_refresh_token) as IPayload;

    const userExists = await usersTokensRepository.findByUserIdAndRefreshToken(
      user_id,
      token,
    );

    if (!userExists) {
      throw new AppError('User does not exists!', 401);
    }

    request.user = {
      id: user_id,
    };

    next();
  } catch {
    throw new AppError('Invalid Token', 401);
  }
}
