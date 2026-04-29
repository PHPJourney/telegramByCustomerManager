# API 接口文档

## 认证模块 (Auth)

### 基础信息

- **Base URL**: `http://localhost:3000/api/auth`
- **Content-Type**: `application/json`

---

## 接口列表

### 1. 用户注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**响应** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "AGENT",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2026-04-29T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应** (400):
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. 用户登录

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "AGENT",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "lastLoginAt": "2026-04-29T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应** (401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. 刷新 Token

**端点**: `POST /api/auth/refresh`

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误响应** (401):
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

---

### 4. 获取当前用户信息

**端点**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "AGENT",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "phone": null,
    "isActive": true,
    "isOnline": false,
    "lastLoginAt": "2026-04-29T00:00:00.000Z",
    "createdAt": "2026-04-29T00:00:00.000Z",
    "updatedAt": "2026-04-29T00:00:00.000Z",
    "agentProfile": null,
    "languagePreference": null
  }
}
```

**错误响应** (401):
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

---

### 5. 更新在线状态

**端点**: `POST /api/auth/status`

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "isOnline": true
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

---

### 6. 登出

**端点**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 使用示例

### cURL 示例

#### 注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

#### 获取用户信息
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 刷新 Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

### JavaScript/Axios 示例

```javascript
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/auth'

// 注册
async function register(userData) {
  try {
    const response = await axios.post(`${API_URL}/register`, userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed')
  }
}

// 登录
async function login(credentials) {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials)
    // 保存 token
    localStorage.setItem('token', response.data.data.token)
    localStorage.setItem('refreshToken', response.data.data.refreshToken)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed')
  }
}

// 获取用户信息
async function getMe() {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user info')
  }
}

// 刷新 Token
async function refreshToken(refreshToken) {
  try {
    const response = await axios.post(`${API_URL}/refresh`, { refreshToken })
    // 更新 token
    localStorage.setItem('token', response.data.data.token)
    localStorage.setItem('refreshToken', response.data.data.refreshToken)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Token refresh failed')
  }
}

// 登出
async function logout() {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
```

---

### React Hook 示例

```typescript
import { useState, useCallback } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })
      const { token, refreshToken, user } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser(user)
      return user
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${API_URL}/register`, userData)
      const { token, refreshToken, user } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser(user)
      return user
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  }
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/认证失败 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 测试账号

使用种子数据创建的测试账号：

```
管理员:
邮箱: admin@example.com
密码: admin123

客服1:
邮箱: agent1@example.com
密码: agent1123

客服2:
邮箱: agent2@example.com
密码: agent2123

客服3:
邮箱: agent3@example.com
密码: agent3123
```

---

## Postman 集合

可以导入以下 Postman 集合进行测试：

```json
{
  "info": {
    "name": "Telegram Customer Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"username\": \"testuser\",\n  \"password\": \"test123456\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

**最后更新**: 2026-04-29  
**版本**: 1.0.0
