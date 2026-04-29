import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

// 公开路由（无需认证）
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)

// 保护路由（需要认证）
router.get('/me', authenticate, authController.me)
router.post('/status', authenticate, authController.updateStatus)
router.post('/logout', authenticate, authController.logout)

export default router
