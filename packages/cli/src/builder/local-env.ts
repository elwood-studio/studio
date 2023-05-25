import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

import type { JsonObject } from '@elwood-studio/types';

export async function buildLocalEnv(): Promise<JsonObject> {
  const iat = new Date().getTime() / 1000;
  const exp = 1799535600;
  const jwtSecret = randomBytes(62).toString('hex');
  const dbPassword = randomBytes(12).toString('hex');
  const anonKey = jwt.sign(
    {
      role: 'anon',
      iss: 'elwood',
      iat,
      exp,
    },
    jwtSecret,
  );
  const serviceKey = jwt.sign(
    {
      role: 'service_role',
      iss: 'elwood',
      iat,
      exp,
    },
    jwtSecret,
  );

  return {
    POSTGRES_PASSWORD: dbPassword,
    JWT_SECRET: jwtSecret,
    ANON_KEY: anonKey,
    SERVICE_ROLE_KEY: serviceKey,
  };
}
