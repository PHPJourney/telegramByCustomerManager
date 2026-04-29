import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface User {
  id: string
  email: string
  username: string
  role: string
  firstName?: string
  lastName?: string
  avatar?: string
  isActive: boolean
  isOnline: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshTokenValue: string | null
  loading: boolean
  error: string | null
  
  // Computed
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuthToken: () => Promise<void>
  clearError: () => void
}

interface RegisterData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  refreshTokenValue: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
  
  // Computed property
  get isAuthenticated() {
    return !!get().token && !!get().user
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { user, token, refreshToken } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      set({
        user,
        token,
        refreshTokenValue: refreshToken,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        loading: false,
      })
      throw error
    }
  },

  register: async (data: RegisterData) => {
    set({ loading: true, error: null })
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data)

      const { user, token, refreshToken } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      set({
        user,
        token,
        refreshTokenValue: refreshToken,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        loading: false,
      })
      throw error
    }
  },

  logout: async () => {
    try {
      const token = get().token
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      set({
        user: null,
        token: null,
        refreshTokenValue: null,
      })
    }
  },

  refreshAuthToken: async () => {
    const currentRefreshToken = get().refreshTokenValue
    
    if (!currentRefreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: currentRefreshToken,
      })

      const { token, refreshToken: newRefreshToken } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      set({
        token,
        refreshTokenValue: newRefreshToken,
      })
    } catch (error) {
      // If refresh fails, logout
      get().logout()
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const store = useAuthStore.getState()
        await store.refreshAuthToken()

        const newToken = useAuthStore.getState().token
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return axios(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
