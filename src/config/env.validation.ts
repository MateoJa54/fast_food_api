import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const formatted = parsed.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`,
    );
  }
  return parsed.data;
}
