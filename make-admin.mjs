/**
 * Run once to make yourself admin:
 *   node make-admin.mjs your@email.com
 */
import { PrismaClient } from '@prisma/client'

const email = process.argv[2]
if (!email) { console.error('Usage: node make-admin.mjs your@email.com'); process.exit(1) }

const prisma = new PrismaClient()
try {
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  })
  console.log(`✓ ${user.email} is now admin`)
} catch (e) {
  console.error('Error:', e.message)
  console.error('Make sure the user has signed up first and DATABASE_URL is set in .env.local')
} finally {
  await prisma.$disconnect()
}
