import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

// Get a single resource
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { allocations: true },
    });

    if (!resource) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    }

    // Calculate remaining amount
    const allocatedAmount = resource.allocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0
    );

    return NextResponse.json({
      ...resource,
      remainingAmount: resource.totalAmount - allocatedAmount,
    });
  } catch (error) {
    console.error('获取资源错误:', error);
    return NextResponse.json({ error: '获取资源时发生错误' }, { status: 500 });
  }
}

// Update a resource
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as
      | (Session & {
          user: { id: string; email?: string | null };
        })
      | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { name, totalAmount } = await request.json();

    // Validate input
    if (!name || typeof totalAmount !== 'number' || totalAmount < 0) {
      return NextResponse.json({ error: '无效的资源信息' }, { status: 400 });
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
      include: { allocations: true },
    });

    if (!existingResource) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    }

    // Calculate allocated amount
    const allocatedAmount = existingResource.allocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0
    );

    // Ensure new total amount is not less than allocated amount
    if (totalAmount < allocatedAmount) {
      return NextResponse.json({ error: '新总量不能小于已分配量' }, { status: 400 });
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: { name, totalAmount },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('更新资源错误:', error);
    return NextResponse.json({ error: '更新资源时发生错误' }, { status: 500 });
  }
}

// Delete a resource
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as
      | (Session & {
          user: { id: string; email?: string | null };
        })
      | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    }

    // Delete the resource (will cascade delete allocations)
    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: '资源已删除' });
  } catch (error) {
    console.error('删除资源错误:', error);
    return NextResponse.json({ error: '删除资源时发生错误' }, { status: 500 });
  }
}
