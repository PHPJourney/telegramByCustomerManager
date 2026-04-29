import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import * as telegramAuthController from '../controllers/telegram-auth.controller'
import * as telegramLoginController from '../controllers/telegram-login.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

// 公开路由（无需认证）
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/telegram/login', telegramAuthController.telegramLogin)

// Telegram MTProto 登录路由
router.post('/telegram/send-code', telegramLoginController.sendVerificationCode)
router.post('/telegram/sign-in', telegramLoginController.signInWithCode)

// 保护路由（需要认证）
router.get('/me', authenticate, authController.me)
router.post('/status', authenticate, authController.updateStatus)
router.post('/logout', authenticate, authController.logout)

export default router
