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
    const { phoneNumber, apiId, apiHash } = req.body

    if (!phoneNumber || !apiId || !apiHash) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数',
      })
    }

    // 创建客户端实例
    const client = new TelegramClientService({
      apiId: Number(apiId),
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
      message: '验证码已发送',
      data: {
        sessionId,
        phoneCodeHash: '', // telegram 库可能不返回这个
      },
    })
  } catch (error: any) {
    logger.error('Send verification code error:', error)
    res.status(500).json({
      success: false,
      message: error.message || '发送验证码失败',
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

/**
 * 获取 API 配置信息
 * GET /api/auth/telegram/config
 */
export const getTelegramConfig = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        apiId: process.env.TELEGRAM_API_ID || '',
        apiHash: process.env.TELEGRAM_API_HASH || '',
        instructions: [
          '1. 访问 https://my.telegram.org/apps',
          '2. 登录您的 Telegram 账号',
          '3. 创建新应用获取 API ID 和 API Hash',
          '4. 填写到下方表单中',
        ],
      },
    })
  } catch (error: any) {
    logger.error('Get config error:', error)
    res.status(500).json({
      success: false,
      message: error.message || '获取配置失败',
    })
  }
}
