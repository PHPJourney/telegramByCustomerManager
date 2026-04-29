import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        })
      }
      next(error)
    }
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', err)

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error' })
  }

  res.status(500).json({
    error: err.message,
    stack: err.stack,
  })
}
