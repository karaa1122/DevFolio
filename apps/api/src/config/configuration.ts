export default () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://devfolio:devfolio@localhost:5432/devfolio',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/api/v1/auth/github/callback',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'local',
    localPath: process.env.STORAGE_LOCAL_PATH ?? './uploads',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      bucket: process.env.AWS_S3_BUCKET ?? '',
      region: process.env.AWS_REGION ?? 'us-east-1',
    },
  },
  frontend: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
});
