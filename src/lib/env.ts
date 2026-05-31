const env = {
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  AWS_BUCKET: process.env.AWS_BUCKET,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
} as const;

export type EnvKey = keyof typeof env;

export function getEnv(key: EnvKey): string;
export function getEnv(key: EnvKey, defaultValue: string): string;
export function getEnv(key: EnvKey, defaultValue?: string): string {
  const value = env[key];
  if (value) return value;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Environment variable ${key} is not set`);
}
