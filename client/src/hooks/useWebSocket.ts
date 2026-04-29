import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const { token } = useAuthStore()

  const connect = useCallback(() => {
    if (!token) {
      console.warn('No token available for WebSocket connection')
      return
    }

    if (socketRef.current?.connected) {
      console.log('WebSocket already connected')
      return
    }

    socketRef.current = io(WS_URL, {
      path: '/ws',
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected:', socketRef.current?.id)
      options.onConnected?.()
    })

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected')
      options.onDisconnected?.()
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      options.onError?.(error)
    })

    socketRef.current.on('chat:message', (data) => {
      console.log('Received message:', data)
      options.onMessage?.(data)
    })

    socketRef.current.on('conversation:assigned', (data) => {
      console.log('Conversation assigned:', data)
      options.onMessage?.({ type: 'assignment', ...data })
    })

    socketRef.current.on('conversation:closed', (data) => {
      console.log('Conversation closed:', data)
      options.onMessage?.({ type: 'close', ...data })
    })

    socketRef.current.on('agent:status', (data) => {
      console.log('Agent status update:', data)
      options.onMessage?.({ type: 'status', ...data })
    })
  }, [token, options])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const sendMessage = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      console.warn('WebSocket not connected')
      return
    }

    socketRef.current.emit(event, data)
  }, [])

  const sendChatMessage = useCallback((conversationId: string, content: string, type = 'text') => {
    sendMessage('chat:message', {
      conversationId,
      content,
      type,
    })
  }, [sendMessage])

  const updateStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    sendMessage('status:update', { status })
  }, [sendMessage])

  useEffect(() => {
    if (token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    sendMessage,
    sendChatMessage,
    updateStatus,
    disconnect,
  }
}
