import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/error'
import { prisma } from './config/database'

// Routes (will be created later)
// import authRoutes from './routes/auth'
// import telegramRoutes from './routes/telegram'

const app = express()

// Security middleware
app.use(helmet())

// CORS
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', undefined as any) // Will be replaced with actual routes
app.use('/api/telegram', undefined as any)
app.use('/api/conversations', undefined as any)
app.use('/api/messages', undefined as any)
app.use('/api/agents', undefined as any)
app.use('/api/wallets', undefined as any)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use(errorHandler)

// Start server
const PORT = config.port
app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📝 Environment: ${config.nodeEnv}`)
  
  // Test database connection
  try {
    await prisma.$connect()
    logger.info('✅ Database connected successfully')
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
  }
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

export default app
