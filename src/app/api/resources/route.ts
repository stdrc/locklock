import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

// Get all resources
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        allocations: true,
      },
    });

    // Calculate remaining amount for each resource
    const resourcesWithRemaining = resources.map(resource => {
      const allocatedAmount = resource.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      return {
        ...resource,
        remainingAmount: resource.totalAmount - allocatedAmount,
      };
    });

    return NextResponse.json(resourcesWithRemaining);
  } catch (error) {
    console.error("获取资源错误:", error);
    return NextResponse.json({ error: "获取资源时发生错误" }, { status: 500 });
  }
}

// Create a new resource
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session & {
      user: { id: string; email?: string | null }
    } | null;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, totalAmount } = await request.json();

    // Validate input
    if (!name || typeof totalAmount !== 'number' || totalAmount < 0) {
      return NextResponse.json({ error: "无效的资源信息" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        totalAmount,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("创建资源错误:", error);
    return NextResponse.json({ error: "创建资源时发生错误" }, { status: 500 });
  }
}