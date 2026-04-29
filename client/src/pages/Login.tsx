import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TelegramLoginButton from '../components/TelegramLoginButton'

export default function Login() {
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#0088cc] rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Telegram 客服系统
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            使用 Telegram 账号登录以继续使用
          </p>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {loginError}
          </div>
        )}

        {/* Telegram Login Button */}
        <div className="mt-8">
          <TelegramLoginButton 
            botUsername={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YourBotUsername'}
            onAuthSuccess={() => {
              console.log('✅ Telegram login success')
              navigate('/dashboard')
            }}
            onAuthError={(error) => {
              console.error('❌ Telegram login error:', error)
              setLoginError(error.message || '登录失败，请重试')
            }}
          />
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            点击按钮后，Telegram 将请求授权
          </p>
          <p className="text-xs text-gray-500 mt-1">
            无需注册，直接使用您的 Telegram 账号
          </p>
        </div>

        {/* Help Link */}
        <div className="text-center">
          <a 
            href="https://t.me/YourSupportBot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-500 inline-flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>需要帮助？联系支持</span>
          </a>
        </div>
      </div>
    </div>
  )
}
