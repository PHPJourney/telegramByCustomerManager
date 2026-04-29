import { prisma } from '../config/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { logger } from '../utils/logger'
import { z } from 'zod'

// 验证 Schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
})

/**
 * 用户注册
 */
export const register = async (data: {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}) => {
  try {
    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingEmail) {
      throw new Error('Email already registered')
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (existingUsername) {
      throw new Error('Username already taken')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'AGENT', // 默认角色为客服
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    // 生成 JWT Token
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    logger.info(`User registered: ${user.email}`)

    return {
      user,
      token,
      refreshToken,
    }
  } catch (error) {
    logger.error('Registration error:', error)
    throw error
  }
}

/**
 * 用户登录
 */
export const login = async (data: { email: string; password: string }) => {
  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // 检查账户是否激活
    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // 生成 JWT Token
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    logger.info(`User logged in: ${user.email}`)

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    }
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}

/**
 * 刷新 Token
 */
export const refreshToken = async (refreshToken: string) => {
  try {
    // 验证 Refresh Token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      throw new Error('Invalid refresh token')
    }

    // 生成新的 Token
    const token = generateToken(user)
    const newRefreshToken = generateRefreshToken(user)

    return {
      token,
      refreshToken: newRefreshToken,
    }
  } catch (error) {
    logger.error('Refresh token error:', error)
    throw new Error('Invalid refresh token')
  }
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        isActive: true,
        isOnline: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        agentProfile: true,
        languagePreference: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    logger.error('Get current user error:', error)
    throw error
  }
}

/**
 * 更新用户在线状态
 */
export const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    })
  } catch (error) {
    logger.error('Update online status error:', error)
    throw error
  }
}

/**
 * 生成 Access Token
 */
const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  )
}

/**
 * 生成 Refresh Token
 */
const generateRefreshToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
    },
    config.jwtRefreshSecret,
    {
      expiresIn: config.jwtRefreshExpiresIn,
    }
  )
}
