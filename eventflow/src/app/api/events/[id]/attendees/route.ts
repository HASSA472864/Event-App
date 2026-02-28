import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  })

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const checkedIn = searchParams.get("checkedIn")

  const where: any = { eventId }
  if (status) where.status = status
  if (checkedIn === "true") where.checkedIn = true
  if (checkedIn === "false") where.checkedIn = false
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }
  }

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      ticket: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = await prisma.registration.groupBy({
    by: ["status"],
    where: { eventId },
    _count: true,
  })

  const checkedInCount = await prisma.registration.count({
    where: { eventId, checkedIn: true },
  })

  return NextResponse.json({
    registrations,
    stats: {
      total: registrations.length,
      confirmed: stats.find((s) => s.status === "CONFIRMED")?._count || 0,
      pending: stats.find((s) => s.status === "PENDING")?._count || 0,
      cancelled: stats.find((s) => s.status === "CANCELLED")?._count || 0,
      checkedIn: checkedInCount,
    },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  })

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { registrationId, action } = await req.json()

  if (action === "cancel") {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: "CANCELLED" },
    })
  } else if (action === "confirm") {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: "CONFIRMED" },
    })
  } else if (action === "checkin") {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { checkedIn: true, checkedInAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
