import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Telegram Bot
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramWebhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  
  // Telegram API (MTProto)
  telegramApiId: process.env.TELEGRAM_API_ID || '',
  telegramApiHash: process.env.TELEGRAM_API_HASH || '',
  telegramSessionPath: process.env.TELEGRAM_SESSION_PATH || './sessions',
  
  // Telegram Proxy
  telegramProxyEnabled: process.env.TELEGRAM_PROXY_ENABLED === 'true',
  telegramProxyHost: process.env.TELEGRAM_PROXY_HOST || '',
  telegramProxyPort: parseInt(process.env.TELEGRAM_PROXY_PORT || '1080', 10),
  telegramProxyUsername: process.env.TELEGRAM_PROXY_USERNAME || '',
  telegramProxyPassword: process.env.TELEGRAM_PROXY_PASSWORD || '',
  
  // AI Service
  aiServiceUrl: process.env.AI_SERVICE_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  aiTimeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
  aiMaxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  
  // WebSocket
  wsPort: parseInt(process.env.WS_PORT || '3001', 10),
  wsCorsOrigins: process.env.WS_CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ],
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Customer Service
  maxConcurrentChatsPerAgent: parseInt(process.env.MAX_CONCURRENT_CHATS_PER_AGENT || '10', 10),
  messageQueueName: process.env.MESSAGE_QUEUE_NAME || 'customer-messages',
  assignmentStrategy: process.env.ASSIGNMENT_STRATEGY || 'round-robin',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
}
