import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as authService from '../services/auth.service'
import { validateRequest } from '../middleware/error'
import { registerSchema, loginSchema } from '../services/auth.service'
import { logger } from '../utils/logger'

/**
 * 用户注册
 * POST /api/auth/register
 */
export const register = [
  validateRequest(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, username, password, firstName, lastName } = req.body

      const result = await authService.register({
        email,
        username,
        password,
        firstName,
        lastName,
      })

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      })
    } catch (error: any) {
      logger.error('Register controller error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      })
    }
  },
]

/**
 * 用户登录
 * POST /api/auth/login
 */
export const login = [
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      const result = await authService.login({
        email,
        password,
      })

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error: any) {
      logger.error('Login controller error:', error)
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      })
    }
  },
]

/**
 * 刷新 Token
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      })
    }

    const result = await authService.refreshToken(refreshToken)

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    })
  } catch (error: any) {
    logger.error('Refresh token controller error:', error)
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    })
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    const user = await authService.getCurrentUser(req.user.id)

    res.json({
      success: true,
      data: user,
    })
  } catch (error: any) {
    logger.error('Get current user controller error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user info',
    })
  }
}

/**
 * 更新在线状态
 * POST /api/auth/status
 */
export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    const { isOnline } = req.body

    await authService.updateOnlineStatus(req.user.id, isOnline)

    res.json({
      success: true,
      message: 'Status updated successfully',
    })
  } catch (error: any) {
    logger.error('Update status controller error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update status',
    })
  }
}

/**
 * 登出
 * POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
    }

    // 更新在线状态为离线
    await authService.updateOnlineStatus(req.user.id, false)

    res.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error: any) {
    logger.error('Logout controller error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Logout failed',
    })
  }
}
