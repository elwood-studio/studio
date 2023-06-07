import { verify } from 'jsonwebtoken';
import { type FastifyRequest } from 'fastify';

import { getConfig } from './get-config';
import invariant from 'ts-invariant';

const { jwtSecret } = getConfig();

export type AuthToken = {
  sub?: string;
  role?: string;
};

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