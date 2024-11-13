import prisma from '@/db'

async function main() {
  const users = await prisma.user.findMany()
  for (const user of users) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    })
  }
}

void main()
