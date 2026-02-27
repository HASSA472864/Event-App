import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      analytics: true,
      tickets: true,
      registrations: {
        include: { ticket: { select: { name: true, price: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const totalRegistrations = event.registrations.length
  const confirmedRegistrations = event.registrations.filter(
    (r) => r.status === "CONFIRMED"
  ).length
  const checkedIn = event.registrations.filter((r) => r.checkedIn).length
  const totalRevenue = event.registrations
    .filter((r) => r.status === "CONFIRMED")
    .reduce((sum, r) => {
      const ticket = event.tickets.find((t) => t.id === r.ticketId)
      return sum + (ticket?.price || 0)
    }, 0)

  const ticketBreakdown = event.tickets.map((t) => ({
    name: t.name,
    sold: t.sold,
    total: t.quantity,
    revenue: t.sold * t.price,
    price: t.price,
  }))

  const registrationsByDay: Record<string, number> = {}
  event.registrations.forEach((r) => {
    const day = new Date(r.createdAt).toISOString().split("T")[0]
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1
  })
  const registrationTrend = Object.entries(registrationsByDay).map(([date, count]) => ({
    date,
    count,
  }))

  const revenueByDay: Record<string, number> = {}
  event.registrations
    .filter((r) => r.status === "CONFIRMED")
    .forEach((r) => {
      const day = new Date(r.createdAt).toISOString().split("T")[0]
      const ticket = event.tickets.find((t) => t.id === r.ticketId)
      revenueByDay[day] = (revenueByDay[day] || 0) + (ticket?.price || 0)
    })
  const revenueTrend = Object.entries(revenueByDay).map(([date, amount]) => ({
    date,
    amount,
  }))

  return NextResponse.json({
    overview: {
      totalRegistrations,
      confirmedRegistrations,
      checkedIn,
      totalRevenue,
      capacity: event.capacity,
      conversionRate: event.analytics?.pageViews
        ? ((confirmedRegistrations / event.analytics.pageViews) * 100).toFixed(1)
        : "0",
      pageViews: event.analytics?.pageViews || 0,
      checkInRate: confirmedRegistrations
        ? ((checkedIn / confirmedRegistrations) * 100).toFixed(1)
        : "0",
    },
    ticketBreakdown,
    registrationTrend,
    revenueTrend,
  })
}
