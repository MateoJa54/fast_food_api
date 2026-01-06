import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
