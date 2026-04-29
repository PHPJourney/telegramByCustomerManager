import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 清理现有数据
  await prisma.systemLog.deleteMany()
  await prisma.quickReply.deleteMany()
  await prisma.languagePreference.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.telegramAccount.deleteMany()
  await prisma.telegramBot.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.agent.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleaned existing data')

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
  })
  console.log('✓ Created admin user')

  // 创建客服用户
  const agents = []
  for (let i = 1; i <= 3; i++) {
    const agentPassword = await bcrypt.hash(`agent${i}123`, 10)
    const user = await prisma.user.create({
      data: {
        email: `agent${i}@example.com`,
        username: `agent${i}`,
        password: agentPassword,
        role: 'AGENT',
        firstName: `Agent`,
        lastName: `${i}`,
        isActive: true,
        agentProfile: {
          create: {
            maxConcurrentChats: 10,
            specialties: ['General', 'Technical'],
          },
        },
      },
    })
    agents.push(user)
  }
  console.log('✓ Created 3 agent users')

  // 创建 Telegram Bot 配置
  const bot = await prisma.telegramBot.create({
    data: {
      botToken: 'YOUR_BOT_TOKEN_HERE',
      botUsername: 'test_bot',
      botName: 'Test Customer Service Bot',
      isActive: true,
      autoAssign: true,
    },
  })
  console.log('✓ Created Telegram bot configuration')

  // 创建测试客户
  const customers = []
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.customer.create({
      data: {
        telegramId: BigInt(123456789 + i),
        username: `customer${i}`,
        firstName: `Customer`,
        lastName: `${i}`,
        languageCode: i % 2 === 0 ? 'en' : 'zh-hans',
      },
    })
    customers.push(customer)
  }
  console.log('✓ Created 5 test customers')

  // 创建快捷回复模板
  const quickReplies = [
    {
      title: '问候语',
      content: '您好！很高兴为您服务，请问有什么可以帮助您的吗？',
      category: 'greeting',
      isGlobal: true,
    },
    {
      title: '感谢语',
      content: '感谢您的咨询，如果还有其他问题，欢迎随时联系我们。',
      category: 'closing',
      isGlobal: true,
    },
    {
      title: '等待提示',
      content: '请您稍等，我正在为您查询相关信息。',
      category: 'waiting',
      isGlobal: true,
    },
  ]

  for (const reply of quickReplies) {
    await prisma.quickReply.create({
      data: reply,
    })
  }
  console.log('✓ Created quick reply templates')

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📋 Test Credentials:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Agent 1: agent1@example.com / agent1123')
  console.log('Agent 2: agent2@example.com / agent2123')
  console.log('Agent 3: agent3@example.com / agent3123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
