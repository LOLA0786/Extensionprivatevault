/**
 * Backend configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://privatevault:dev@localhost:5432/privatevault',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET || 'privatevault-payloads',
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  merkle: {
    anchorInterval: parseInt(process.env.MERKLE_ANCHOR_INTERVAL || '3600', 10), // 1 hour
    enableBlockchainAnchor: process.env.ENABLE_BLOCKCHAIN_ANCHOR === 'true',
  },
};
