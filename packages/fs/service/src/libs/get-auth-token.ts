import * as authHeader from 'auth-header';
import { verify } from 'jsonwebtoken';
import { type FastifyRequest } from 'fastify';
import { invariant } from '@elwood/common';

import { getEnv } from './get-env.ts';
import type { AuthToken, PossibleAuthToken } from '@/types.ts';

const { jwtSecret } = getEnv();

export function getAuthToken(token: PossibleAuthToken): AuthToken {
  invariant(token, 'token is required');

  if (typeof token === 'object') {
    return token as AuthToken;
  }

  const auth = authHeader.parse(token);

  if (
    auth.scheme != 'Bearer' ||
    !auth.token ||
    typeof auth.token !== 'string'
  ) {
    return {};
  }

  const jwt = verify(auth.token, jwtSecret);
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
