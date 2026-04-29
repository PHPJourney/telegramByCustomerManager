import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface TelegramLoginButtonProps {
  botUsername: string
  onAuthSuccess?: () => void
  onAuthError?: (error: Error) => void
}

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void
  }
}

export default function TelegramLoginButton({ 
  botUsername, 
  onAuthSuccess,
  onAuthError 
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    // 创建 script 元素加载 Telegram Login Widget
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    
    // 设置属性
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', 'onTelegramAuth')

    // 定义全局回调函数
    window.onTelegramAuth = async (user) => {
      try {
        console.log('Telegram auth success:', user)
        
        // 调用后端 API 验证并登录
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Telegram login failed')
        }

        // 保存 token
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        
        // 更新 store
        await login(data.data.user.email, '') // 邮箱和密码用于兼容，实际不使用
        
        // 导航到仪表板
        navigate('/dashboard')
        
        onAuthSuccess?.()
      } catch (error: any) {
        console.error('Telegram login error:', error)
        onAuthError?.(error)
      }
    }

    // 添加 script 到容器
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(script)
    }

    // 清理
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      window.onTelegramAuth = undefined as any
    }
  }, [botUsername, navigate, login, onAuthSuccess, onAuthError])

  return (
    <div className="flex justify-center">
      <div ref={containerRef} />
    </div>
  )
}
