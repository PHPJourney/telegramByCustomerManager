import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { Api } from 'telegram/tl'
import { logger } from '../utils/logger'
import { config } from '../config'

interface TelegramAccountConfig {
  apiId: number
  apiHash: string
  phoneNumber: string
  sessionData?: string
}

interface UserInfo {
  id: number
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
  isPremium?: boolean
  photoUrl?: string
}

interface MessageData {
  id: number
  chatId: number
  senderId?: number
  content: string
  timestamp: Date
  isOutgoing: boolean
  replyToMessageId?: number
}

/**
 * Telegram MTProto 客户端服务
 * 用于直接连接 Telegram 获取用户和消息数据
 */
export class TelegramClientService {
  private client: TelegramClient | null = null
  private session: StringSession
  private isConnected: boolean = false
  private accountInfo: UserInfo | null = null

  constructor(config: TelegramAccountConfig) {
    this.session = new StringSession(config.sessionData || '')
    
    this.client = new TelegramClient(
      this.session,
      config.apiId,
      config.apiHash,
      {
        connectionRetries: 5,
        useWSS: true,
      }
    )
  }

  /**
   * 连接到 Telegram
   */
  async connect(phoneNumber: string): Promise<void> {
    try {
      await this.client!.connect()
      
      // 检查是否已授权
      const isAuthorized = await this.client!.isUserAuthorized()
      
      if (!isAuthorized) {
        // 发送验证码
        const result = await this.client!.sendCode(
          { apiId: this.client!.apiId as number, apiHash: this.client!.apiHash as string },
          phoneNumber
        )
        
        logger.info(`Verification code sent to ${phoneNumber}`)
        return
      }

      // 获取用户信息
      await this.fetchUserInfo()
      this.isConnected = true
      
      logger.info(`Connected to Telegram as ${this.accountInfo?.username}`)
    } catch (error) {
      logger.error('Failed to connect to Telegram:', error)
      throw error
    }
  }

  /**
   * 使用验证码登录
   */
  async signInWithCode(phoneNumber: string, code: string): Promise<UserInfo> {
    try {
      await this.client!.start({
        phoneNumber: async () => phoneNumber,
        password: async () => '',
        phoneCode: async () => code,
        onError: (err: any) => {
          logger.error('Sign in error:', err)
          throw err
        },
      })

      await this.fetchUserInfo()
      this.isConnected = true

      logger.info(`Signed in successfully: ${this.accountInfo?.username}`)
      return this.accountInfo!
    } catch (error) {
      logger.error('Failed to sign in:', error)
      throw error
    }
  }

  /**
   * 使用密码登录（如果开启了两步验证）
   */
  async signInWithPassword(password: string): Promise<UserInfo> {
    try {
      await this.client!.start({
        phoneNumber: async () => '',
        password: async () => password,
        phoneCode: async () => '',
        onError: (err: any) => {
          logger.error('Sign in error:', err)
          throw err
        },
      })

      await this.fetchUserInfo()
      this.isConnected = true

      return this.accountInfo!
    } catch (error) {
      logger.error('Failed to sign in with password:', error)
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  private async fetchUserInfo(): Promise<void> {
    try {
      const me = await this.client!.getMe()
      
      this.accountInfo = {
        id: Number(me.id),
        firstName: me.firstName,
        lastName: me.lastName,
        username: me.username,
        phone: me.phone,
        isPremium: (me as any).premium || false,
        photoUrl: undefined,
      }

      logger.info(`User info fetched: ${this.accountInfo?.username}`)
    } catch (error) {
      logger.error('Failed to fetch user info:', error)
      throw error
    }
  }

  /**
   * 获取对话列表
   */
  async getConversations(limit: number = 50): Promise<any[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Telegram')
      }

      const dialogs = await this.client!.getDialogs({ limit })
      
      return dialogs.map((dialog: any) => ({
        id: Number(dialog.id),
        name: dialog.name || dialog.title,
        type: dialog.constructor.name,
        unreadCount: dialog.unreadCount,
        lastMessage: dialog.message?.message,
        lastMessageTime: dialog.message?.date,
        photoUrl: null,
      }))
    } catch (error) {
      logger.error('Failed to get conversations:', error)
      throw error
    }
  }

  /**
   * 获取指定对话的消息
   */
  async getMessages(chatId: number, limit: number = 50): Promise<MessageData[]> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Telegram')
      }

      const messages = await this.client!.getMessages(chatId, { limit })
      
      return messages.map((msg: any) => ({
        id: msg.id,
        chatId,
        senderId: msg.senderId ? Number(msg.senderId) : undefined,
        content: msg.message || '',
        timestamp: msg.date,
        isOutgoing: msg.out || false,
        replyToMessageId: msg.replyToMsgId,
      }))
    } catch (error) {
      logger.error(`Failed to get messages for chat ${chatId}:`, error)
      throw error
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(chatId: number, message: string, replyToMessageId?: number): Promise<MessageData> {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Telegram')
      }

      const result = await this.client!.sendMessage(chatId, {
        message,
        replyTo: replyToMessageId,
      })

      return {
        id: result.id,
        chatId,
        senderId: Number(this.accountInfo?.id),
        content: message,
        timestamp: new Date(result.date * 1000),
        isOutgoing: true,
        replyToMessageId,
      }
    } catch (error) {
      logger.error(`Failed to send message to chat ${chatId}:`, error)
      throw error
    }
  }

  /**
   * 监听新消息（实时更新）
   */
  onNewMessage(callback: (message: MessageData) => void): void {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    this.client.addEventHandler((update: any) => {
      if (update.message && update.message.message) {
        const messageData: MessageData = {
          id: update.message.id,
          chatId: Number(update.message.chatId || update.message.peerId?.userId),
          senderId: update.message.fromId ? Number(update.message.fromId.userId) : undefined,
          content: update.message.message,
          timestamp: new Date(update.message.date * 1000),
          isOutgoing: update.message.out || false,
          replyToMessageId: update.message.replyToMsgId,
        }

        callback(messageData)
      }
    })
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect()
        this.isConnected = false
        logger.info('Disconnected from Telegram')
      }
    } catch (error) {
      logger.error('Failed to disconnect:', error)
      throw error
    }
  }

  /**
   * 获取会话数据（用于保存登录状态）
   */
  getSessionData(): string {
    return this.session.save()
  }

  /**
   * 检查连接状态
   */
  getIsConnected(): boolean {
    return this.isConnected
  }

  /**
   * 获取账户信息
   */
  getAccountInfo(): UserInfo | null {
    return this.accountInfo
  }

  /**
   * 获取客户端实例
   */
  getClient(): TelegramClient | null {
    return this.client
  }
}
