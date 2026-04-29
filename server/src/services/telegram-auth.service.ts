import axios from 'axios'
import { config } from '../config'
import { logger } from '../utils/logger'
import { prisma } from '../config/database'
import jwt from 'jsonwebtoken'

/**
 * Telegram 登录数据接口
 */
interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

/**
 * Telegram 认证服务
 */
export class TelegramAuthService {
  /**
   * 验证 Telegram 登录数据
   */
  static verifyTelegramAuth(data: TelegramAuthData): boolean {
    const { hash, auth_date, ...dataWithoutHash } = data
    
    // 检查数据是否过期（24小时）
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - auth_date > 86400) {
      return false
    }

    // 按字母顺序排序参数
    const sortedParams = Object.keys(dataWithoutHash)
      .sort()
      .map(key => `${key}=${dataWithoutHash[key as keyof typeof dataWithoutHash]}`)
      .join('\n')

    // 使用 Bot Token 作为密钥生成 HMAC-SHA256
    const secretKey = this.createSecretHash(config.telegramBotToken)
    const generatedHash = this.hmacSHA256(sortedParams, secretKey)

    return generatedHash === hash
  }

  /**
   * 处理 Telegram 登录
   */
  static async handleTelegramLogin(authData: TelegramAuthData) {
    try {
      // 验证数据
      if (!this.verifyTelegramAuth(authData)) {
        throw new Error('Invalid Telegram auth data')
      }

      // 查找或创建用户
      let user = await prisma.user.findFirst({
        where: {
          telegramAccounts: {
            some: {
              telegramId: BigInt(authData.id)
            }
          }
        },
        include: {
          telegramAccounts: true,
          agentProfile: true,
        }
      })

      if (!user) {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            email: `${authData.id}@telegram.local`,
            username: authData.username || `user_${authData.id}`,
            password: '', // Telegram 登录不需要密码
            firstName: authData.first_name,
            lastName: authData.last_name,
            avatar: authData.photo_url,
            role: 'AGENT', // 默认角色
            telegramAccounts: {
              create: {
                telegramId: BigInt(authData.id),
                phoneNumber: '', // Telegram Login Widget 不提供手机号
                username: authData.username,
                firstName: authData.first_name,
                lastName: authData.last_name,
                isConnected: true,
              }
            },
            agentProfile: {
              create: {
                maxConcurrentChats: 10,
              }
            }
          },
          include: {
            telegramAccounts: true,
            agentProfile: true,
          }
        })

        logger.info(`New user created from Telegram login: ${authData.id}`)
      } else {
        // 更新用户信息
        await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: authData.first_name || user.firstName,
            lastName: authData.last_name || user.lastName,
            avatar: authData.photo_url || user.avatar,
            updatedAt: new Date(),
          }
        })

        // 更新 Telegram 账号信息
        await prisma.telegramAccount.updateMany({
          where: {
            userId: user.id,
            telegramId: BigInt(authData.id),
          },
          data: {
            username: authData.username,
            firstName: authData.first_name,
            lastName: authData.last_name,
            isConnected: true,
            updatedAt: new Date(),
          }
        })

        logger.info(`User logged in via Telegram: ${authData.id}`)
      }

      // 生成 JWT Token
      const token = this.generateToken(user)
      const refreshToken = this.generateRefreshToken(user)

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      }
    } catch (error) {
      logger.error('Telegram login error:', error)
      throw error
    }
  }

  /**
   * 生成访问令牌
   */
  private static generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' } as any
    )
  }

  /**
   * 生成刷新令牌
   */
  private static generateRefreshToken(user: any): string {
    return jwt.sign(
      { id: user.id },
      config.jwtRefreshSecret,
      { expiresIn: '30d' } as any
    )
  }

  /**
   * 创建秘密哈希（用于验证 Telegram 数据）
   */
  private static createSecretHash(token: string): Buffer {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(token).digest()
  }

  /**
   * HMAC-SHA256 签名
   */
  private static hmacSHA256(data: string, key: Buffer): string {
    const crypto = require('crypto')
    return crypto.createHmac('sha256', key).update(data).digest('hex')
  }
}
