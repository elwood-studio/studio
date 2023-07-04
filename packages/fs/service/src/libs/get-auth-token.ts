import { verify } from 'jsonwebtoken';
import { type FastifyRequest } from 'fastify';

import { invariant } from './invariant.ts';
import { getEnv } from './get-env.ts';
import type { AuthToken } from '@/types.ts';

const { jwtSecret } = getEnv();

export function getAuthToken(token: string | AuthToken | undefined): AuthToken {
  invariant(token, 'token is required');

  if (typeof token === 'object') {
    return token as AuthToken;
  }

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
