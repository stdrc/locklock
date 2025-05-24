import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

// Get all allocations for the current user
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as
      | (Session & {
          user: { id: string; email?: string | null };
        })
      | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userAllocations = await prisma.allocation.findMany({
      where: { userId: session.user.id },
      include: { resource: true },
    });

    return NextResponse.json(userAllocations);
  } catch (error) {
    console.error('获取分配信息错误:', error);
    return NextResponse.json({ error: '获取分配信息时发生错误' }, { status: 500 });
  }
}

// Create or update an allocation
export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as
      | (Session & {
          user: { id: string; email?: string | null };
        })
      | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { resourceId, amount } = await request.json();

    // Validate input
    if (!resourceId || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: '无效的分配信息' }, { status: 400 });
    }

    // Get the resource to check availability
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: { allocations: true },
    });

    if (!resource) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    }

    // Calculate current allocated amount
    const totalAllocatedAmount = resource.allocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0
    );

    // Check if there's existing allocation for this user
    const existingAllocation = await prisma.allocation.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    // Calculate how much is already allocated to this user
    const currentUserAmount = existingAllocation ? existingAllocation.amount : 0;

    // Calculate how much more this user wants to allocate
    const additionalAmount = amount - currentUserAmount;

    // Check if there's enough remaining resource
    const remainingAmount = resource.totalAmount - totalAllocatedAmount;

    if (additionalAmount > remainingAmount) {
      return NextResponse.json({ error: '资源余量不足' }, { status: 400 });
    }

    // Create or update the allocation
    const allocation = await prisma.allocation.upsert({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
      update: { amount },
      create: {
        userId: session.user.id,
        resourceId,
        amount,
      },
    });

    return NextResponse.json(allocation, { status: existingAllocation ? 200 : 201 });
  } catch (error) {
    console.error('创建分配错误:', error);
    return NextResponse.json({ error: '创建分配时发生错误' }, { status: 500 });
  }
}

// Delete an allocation
export async function DELETE(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as
      | (Session & {
          user: { id: string; email?: string | null };
        })
      | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json({ error: '资源ID不能为空' }, { status: 400 });
    }

    // Check if allocation exists
    const existingAllocation = await prisma.allocation.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    if (!existingAllocation) {
      return NextResponse.json({ error: '分配不存在' }, { status: 404 });
    }

    // Delete the allocation
    await prisma.allocation.delete({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    return NextResponse.json({ message: '分配已释放' });
  } catch (error) {
    console.error('删除分配错误:', error);
    return NextResponse.json({ error: '删除分配时发生错误' }, { status: 500 });
  }
}
