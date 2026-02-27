import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const [totalEvents, upcomingEvents, totalRegistrations, totalRevenue] =
    await Promise.all([
      prisma.event.count({ where: { organizerId: userId } }),
      prisma.event.findMany({
        where: { organizerId: userId, startDate: { gte: new Date() }, status: "PUBLISHED" },
        orderBy: { startDate: "asc" },
        take: 5,
        include: { category: true, _count: { select: { registrations: true } } },
      }),
      prisma.registration.count({
        where: { event: { organizerId: userId }, status: "CONFIRMED" },
      }),
      prisma.eventAnalytics.aggregate({
        where: { event: { organizerId: userId } },
        _sum: { totalRevenue: true },
      }),
    ])

  return NextResponse.json({
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    totalRevenue: totalRevenue._sum.totalRevenue ?? 0,
  })
}
