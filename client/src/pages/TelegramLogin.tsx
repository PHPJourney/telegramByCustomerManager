import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type LoginStep = 'config' | 'phone' | 'code' | 'password'

export default function TelegramLogin() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  
  const [step, setStep] = useState<LoginStep>('config')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Config step
  const [apiId, setApiId] = useState('')
  const [apiHash, setApiHash] = useState('')
  
  // Phone step
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // Code step
  const [verificationCode, setVerificationCode] = useState('')
  const [sessionId, setSessionId] = useState('')
  
  // Password step (2FA)
  const [password, setPassword] = useState('')

  // 获取配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram/config`
        )
        const data = await response.json()
        
        if (data.success && data.data.apiId) {
          setApiId(data.data.apiId)
          setApiHash(data.data.apiHash)
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
      }
    }
    
    fetchConfig()
  }, [])

  // 第一步：发送验证码
  const handleSendCode = async () => {
    if (!apiId || !apiHash) {
      setError('请填写 API ID 和 API Hash')
      return
    }

    if (!phoneNumber) {
      setError('请填写手机号')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram/send-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            apiId,
            apiHash,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '发送验证码失败')
      }

      setSessionId(data.data.sessionId)
      setStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 第二步：验证代码
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('请输入验证码')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram/sign-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            phoneNumber,
            code: verificationCode,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresPassword) {
          setStep('password')
          return
        }
        throw new Error(data.message || '登录失败')
      }

      // 保存 token
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      
      // 更新 store
      await login(data.data.user.email, '')
      
      // 导航到仪表板
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 第三步：输入密码（2FA）
  const handlePassword = async () => {
    if (!password) {
      setError('请输入密码')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/telegram/sign-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            phoneNumber,
            code: verificationCode,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '登录失败')
      }

      // 保存 token
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      
      // 更新 store
      await login(data.data.user.email, '')
      
      // 导航到仪表板
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0088cc] to-[#00a8e8] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Logo */}
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
            Telegram 登录
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            使用您的 Telegram 账号登录客服系统
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: API Config */}
        {step === 'config' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>如何获取 API 凭证：</strong>
              </p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>访问 <a href="https://my.telegram.org/apps" target="_blank" rel="noopener noreferrer" className="underline">my.telegram.org/apps</a></li>
                <li>登录您的 Telegram 账号</li>
                <li>创建新应用</li>
                <li>复制 API ID 和 API Hash</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API ID
              </label>
              <input
                type="text"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Hash
              </label>
              <input
                type="text"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                placeholder="abcdef1234567890"
              />
            </div>

            <button
              onClick={() => setStep('phone')}
              disabled={!apiId || !apiHash}
              className="w-full py-3 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#0077b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          </div>
        )}

        {/* Step 2: Phone Number */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号（带国家代码）
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                placeholder="+8613800138000"
              />
              <p className="mt-1 text-xs text-gray-500">
                例如：+8613800138000
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('config')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleSendCode}
                disabled={loading || !phoneNumber}
                className="flex-1 py-3 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#0077b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发送中...' : '发送验证码'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verification Code */}
        {step === 'code' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                验证码
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                placeholder="12345"
                maxLength={5}
              />
              <p className="mt-1 text-xs text-gray-500">
                验证码已发送到您的 Telegram
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('phone')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={loading || !verificationCode}
                className="flex-1 py-3 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#0077b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '验证中...' : '验证'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Password (2FA) */}
        {step === 'password' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                您的账号开启了两步验证，请输入密码
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                两步验证密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('code')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handlePassword}
                disabled={loading || !password}
                className="flex-1 py-3 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#0077b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </div>
        )}

        {/* Help Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <a 
            href="https://t.me/YourSupportBot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#0088cc] hover:text-[#0077b3] inline-flex items-center space-x-1"
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
