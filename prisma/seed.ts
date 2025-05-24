import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.allocation.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.resource.deleteMany({});

  // Create a default admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  console.log('已创建管理员用户:', admin);

  // Create some initial resources
  const resource1 = await prisma.resource.create({
    data: {
      name: '示例资源 1',
      totalAmount: 100,
    },
  });

  const resource2 = await prisma.resource.create({
    data: {
      name: '示例资源 2',
      totalAmount: 200,
    },
  });

  console.log('已创建资源:', [resource1, resource2]);

  // Create initial allocations
  const allocation = await prisma.allocation.create({
    data: {
      amount: 50,
      userId: admin.id,
      resourceId: resource1.id,
    },
  });

  console.log('已创建分配:', allocation);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });