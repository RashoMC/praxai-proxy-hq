import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function test() {
  try {
    const count = await prisma.lead.count()
    console.log('Leads count:', count)
    const agents = await prisma.agent.findMany()
    console.log('Agents:', agents)
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}
test()
