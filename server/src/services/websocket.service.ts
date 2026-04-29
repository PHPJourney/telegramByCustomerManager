import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { logger } from '../utils/logger'

interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

export class WebSocketService {
  private io: Server
  private connectedUsers: Map<string, Set<string>> = new Map() // userId -> socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/ws',
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    
    logger.info('WebSocket service initialized')
  }

  /**
   * 设置认证中间件
   */
  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error'))
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as any
        socket.userId = decoded.id
        socket.userRole = decoded.role
        next()
      } catch (error) {
        logger.error('WebSocket authentication failed:', error)
        next(new Error('Authentication error'))
      }
    })
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!
      
      logger.info(`User connected: ${userId}, Socket ID: ${socket.id}`)

      // 添加用户到连接列表
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set())
      }
      this.connectedUsers.get(userId)!.add(socket.id)

      // 加入用户房间
      socket.join(`user:${userId}`)
      
      // 如果是客服，加入客服房间
      if (socket.userRole === 'AGENT' || socket.userRole === 'ADMIN') {
        socket.join('agents')
      }

      // 发送连接成功消息
      socket.emit('connected', {
        userId,
        message: 'Connected successfully',
      })

      // 监听断开连接
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${userId}, Socket ID: ${socket.id}`)
        
        const userSockets = this.connectedUsers.get(userId)
        if (userSockets) {
          userSockets.delete(socket.id)
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId)
            
            // 广播用户离线状态
            this.io.emit('user:offline', { userId })
          }
        }
      })

      // 监听错误
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${userId}:`, error)
      })

      // 监听聊天消息
      socket.on('chat:message', (data) => {
        this.handleChatMessage(socket, data)
      })

      // 监听会话操作
      socket.on('conversation:action', (data) => {
        this.handleConversationAction(socket, data)
      })

      // 监听在线状态更新
      socket.on('status:update', (data) => {
        this.handleStatusUpdate(socket, data)
      })
    })
  }

  /**
   * 处理聊天消息
   */
  private handleChatMessage(socket: AuthenticatedSocket, data: any) {
    const { conversationId, content, type = 'text' } = data
    
    logger.info(`Message from ${socket.userId} in conversation ${conversationId}`)

    // 广播消息给对话中的所有参与者
    this.io.to(`conversation:${conversationId}`).emit('chat:message', {
      conversationId,
      senderId: socket.userId,
      content,
      type,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 处理会话操作
   */
  private handleConversationAction(socket: AuthenticatedSocket, data: any) {
    const { action, conversationId, payload } = data

    logger.info(`Conversation action: ${action} by ${socket.userId}`)

    switch (action) {
      case 'assign':
        // 分配会话给客服
        this.io.to(`conversation:${conversationId}`).emit('conversation:assigned', {
          conversationId,
          agentId: payload.agentId,
          assignedBy: socket.userId,
        })
        break
      
      case 'close':
        // 关闭会话
        this.io.to(`conversation:${conversationId}`).emit('conversation:closed', {
          conversationId,
          closedBy: socket.userId,
        })
        break
      
      case 'transfer':
        // 转接会话
        this.io.to(`conversation:${conversationId}`).emit('conversation:transferred', {
          conversationId,
          fromAgentId: socket.userId,
          toAgentId: payload.toAgentId,
        })
        break
    }
  }

  /**
   * 处理在线状态更新
   */
  private handleStatusUpdate(socket: AuthenticatedSocket, data: any) {
    const { status } = data // 'online', 'away', 'busy', 'offline'
    
    logger.info(`Status update: ${socket.userId} -> ${status}`)

    // 广播状态更新给所有客服
    this.io.to('agents').emit('agent:status', {
      agentId: socket.userId,
      status,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 向指定用户发送消息
   */
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  /**
   * 向对话中的所有参与者发送消息
   */
  public sendToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit(event, data)
  }

  /**
   * 向所有客服发送消息
   */
  public sendToAgents(event: string, data: any) {
    this.io.to('agents').emit(event, data)
  }

  /**
   * 广播消息给所有人
   */
  public broadcast(event: string, data: any) {
    this.io.emit(event, data)
  }

  /**
   * 获取在线用户列表
   */
  public getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys())
  }

  /**
   * 检查用户是否在线
   */
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }

  /**
   * 获取服务器实例
   */
  public getServer(): Server {
    return this.io
  }
}
