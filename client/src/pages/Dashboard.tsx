import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

// Mock data - will be replaced with real API calls
const mockConversations = [
  {
    id: '1',
    customerName: '张三',
    lastMessage: '你好，我想咨询一下产品',
    timestamp: '2分钟前',
    unread: 2,
    status: 'active',
    avatar: null,
  },
  {
    id: '2',
    customerName: '李四',
    lastMessage: '订单什么时候发货？',
    timestamp: '10分钟前',
    unread: 0,
    status: 'waiting',
    avatar: null,
  },
  {
    id: '3',
    customerName: '王五',
    lastMessage: '谢谢你的帮助！',
    timestamp: '1小时前',
    unread: 0,
    status: 'resolved',
    avatar: null,
  },
]

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'resolved'>('all')

  const filteredConversations = mockConversations.filter(conv => 
    filter === 'all' ? true : conv.status === filter
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Telegram 客服系统</h1>
              <p className="text-sm text-gray-500">欢迎回来，{user?.firstName || user?.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">在线</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Filter Tabs */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              {(['all', 'active', 'waiting', 'resolved'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filter === f
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f === 'all' && '全部'}
                  {f === 'active' && '进行中'}
                  {f === 'waiting' && '等待中'}
                  {f === 'resolved' && '已解决'}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {conv.customerName.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {conv.customerName}
                      </h3>
                      <span className="text-xs text-gray-500">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    
                    {/* Status Badge */}
                    <div className="mt-2 flex items-center space-x-2">
                      {conv.unread > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          {conv.unread} 未读
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        conv.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        conv.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {conv.status === 'active' && '进行中'}
                        {conv.status === 'waiting' && '等待中'}
                        {conv.status === 'resolved' && '已解决'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">12</p>
                <p className="text-xs text-gray-600">进行中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">5</p>
                <p className="text-xs text-gray-600">等待中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">48</p>
                <p className="text-xs text-gray-600">今日已解决</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">张</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">张三</h2>
                      <p className="text-sm text-gray-500">Telegram ID: @zhangsan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      标记为已解决
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      转接客服
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Sample Messages */}
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <p className="text-sm text-gray-900">你好，我想咨询一下产品</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-primary-500 rounded-lg px-4 py-2">
                      <p className="text-sm text-white">您好！很高兴为您服务，请问有什么可以帮助您的？</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">10:31 AM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <p className="text-sm text-gray-900">我想了解一下你们的产品价格和功能</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="输入消息..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    发送
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个会话开始聊天</h3>
                <p className="text-sm text-gray-500">从左侧列表中选择客户会话</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Customer Info */}
        {selectedConversation && (
          <aside className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">客户信息</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">姓名</label>
                  <p className="text-sm text-gray-900 mt-1">张三</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Telegram ID</label>
                  <p className="text-sm text-gray-900 mt-1">@zhangsan</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">注册时间</label>
                  <p className="text-sm text-gray-900 mt-1">2024-01-15</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">会话历史</label>
                  <p className="text-sm text-gray-900 mt-1">5 次</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">最后活跃</label>
                  <p className="text-sm text-gray-900 mt-1">2 分钟前</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">备注</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="添加客户备注..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                    查看完整资料
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
