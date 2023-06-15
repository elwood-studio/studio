import { verify } from 'jsonwebtoken';
import { type FastifyRequest } from 'fastify';
import invariant from 'ts-invariant';

import { getEnv } from './get-env';
import type { AuthToken } from '../types';

const { jwtSecret } = getEnv();

export function getAuthToken(token: string | undefined): AuthToken {
  invariant(token, 'token is required');
  const jwt = verify(token.replace('Bearer ', ''), jwtSecret);
  return jwt as AuthToken;
}

export function getAuthTokenFromRequest(
  req: FastifyRequest,
): AuthToken | undefined {
  if (req.headers.authorization) {
    return getAuthToken(req.headers.authorization);
  }

  return {};
}
