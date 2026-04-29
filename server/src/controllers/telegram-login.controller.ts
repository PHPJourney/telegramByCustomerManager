import { Request, Response } from 'express'
import { TelegramClientService } from '../services/telegram-client.service'
import { logger } from '../utils/logger'
import { prisma } from '../config/database'
import jwt from 'jsonwebtoken'
import { config } from '../config'

// 存储临时的客户端实例（生产环境应该用 Redis）
const clientSessions = new Map<string, TelegramClientService>()

/**
 * 第一步：发送验证码
 * POST /api/auth/telegram/send-code
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: '请输入手机号',
      })
    }

    // 从环境变量获取 API 配置
    const apiId = Number(process.env.TELEGRAM_API_ID)
    const apiHash = process.env.TELEGRAM_API_HASH

    logger.info(`Attempting to send code to ${phoneNumber}`)
    logger.info(`API ID configured: ${!!apiId}, API Hash configured: ${!!apiHash}`)

    if (!apiId || !apiHash) {
      logger.error('Telegram API credentials not configured')
      return res.status(500).json({
        success: false,
        message: '服务器配置错误：缺少 Telegram API 凭证',
      })
    }

    // 创建客户端实例
    const client = new TelegramClientService({
      apiId,
      apiHash,
      phoneNumber,
    })

    // 连接到 Telegram
    await client.connect(phoneNumber)

    // 保存会话 ID
    const sessionId = `${phoneNumber}_${Date.now()}`
    clientSessions.set(sessionId, client)

    logger.info(`Verification code sent to ${phoneNumber}`)

    res.json({
      success: true,
      message: '验证码已发送到您的 Telegram',
      data: {
        sessionId,
      },
    })
  } catch (error: any) {
    logger.error('Send verification code error:', error)
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    
    // 更友好的错误消息
    let errorMessage = '发送验证码失败'
    
    if (error.message?.includes('connection')) {
      errorMessage = '无法连接到 Telegram 服务器，请检查网络连接或代理配置'
    } else if (error.message?.includes('PHONE_NUMBER_INVALID')) {
      errorMessage = '手机号格式不正确，请使用国际格式（如 +8613800138000）'
    } else if (error.message?.includes('FLOOD_WAIT')) {
      errorMessage = '请求过于频繁，请稍后再试'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
    })
  }
}

/**
 * 第二步：使用验证码登录
 * POST /api/auth/telegram/sign-in
 */
export const signInWithCode = async (req: Request, res: Response) => {
  try {
    const { sessionId, phoneNumber, code, password } = req.body

    if (!sessionId || !phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数',
      })
    }

    // 获取客户端实例
    const client = clientSessions.get(sessionId)
    if (!client) {
      return res.status(404).json({
        success: false,
        message: '会话已过期，请重新发送验证码',
      })
    }

    let userInfo

    try {
      // 尝试使用验证码登录
      userInfo = await client.signInWithCode(phoneNumber, code)
    } catch (error: any) {
      // 如果需要密码（两步验证）
      if (error.message?.includes('password') || error.message?.includes('2FA')) {
        if (!password) {
          return res.status(400).json({
            success: false,
            message: '需要两步验证密码',
            requiresPassword: true,
          })
        }
        
        userInfo = await client.signInWithPassword(password)
      } else {
        throw error
      }
    }

    // 保存会话数据
    const sessionData = client.getSessionData()

    // 查找或创建用户
    let user = await prisma.user.findFirst({
      where: {
        telegramAccounts: {
          some: {
            telegramId: BigInt(userInfo.id),
          },
        },
      },
      include: {
        telegramAccounts: true,
        agentProfile: true,
      },
    })

    if (!user) {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          email: `${userInfo.id}@telegram.local`,
          username: userInfo.username || `user_${userInfo.id}`,
          password: '',
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: 'AGENT',
          telegramAccounts: {
            create: {
              telegramId: BigInt(userInfo.id),
              phoneNumber: userInfo.phone || phoneNumber,
              username: userInfo.username,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              sessionData,
              isConnected: true,
            },
          },
          agentProfile: {
            create: {
              maxConcurrentChats: 10,
            },
          },
        },
        include: {
          telegramAccounts: true,
          agentProfile: true,
        },
      })

      logger.info(`New user created from Telegram: ${userInfo.id}`)
    } else {
      // 更新会话数据
      await prisma.telegramAccount.updateMany({
        where: {
          userId: user.id,
          telegramId: BigInt(userInfo.id),
        },
        data: {
          sessionData,
          isConnected: true,
          updatedAt: new Date(),
        },
      })

      logger.info(`User signed in via Telegram: ${userInfo.id}`)
    }

    // 生成 JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' } as any
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwtRefreshSecret,
      { expiresIn: '30d' } as any
    )

    // 清理会话
    clientSessions.delete(sessionId)

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          telegramInfo: userInfo,
        },
        token,
        refreshToken,
      },
    })
  } catch (error: any) {
    logger.error('Sign in error:', error)
    res.status(401).json({
      success: false,
      message: error.message || '登录失败',
    })
  }
}


