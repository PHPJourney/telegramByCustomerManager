import { Request, Response } from 'express'
import { TelegramAuthService } from '../services/telegram-auth.service'
import { logger } from '../utils/logger'

/**
 * Telegram 登录回调
 * POST /api/auth/telegram/login
 */
export const telegramLogin = async (req: Request, res: Response) => {
  try {
    const authData = req.body

    // 验证必需字段
    if (!authData.id || !authData.hash || !authData.auth_date) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Telegram auth data',
      })
    }

    // 处理 Telegram 登录
    const result = await TelegramAuthService.handleTelegramLogin(authData)

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    })
  } catch (error: any) {
    logger.error('Telegram login error:', error)
    res.status(401).json({
      success: false,
      message: error.message || 'Telegram login failed',
    })
  }
}
