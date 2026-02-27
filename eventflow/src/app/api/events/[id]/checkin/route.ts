import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { organizerId: true, title: true },
  })

  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { qrCode } = await req.json()

  if (!qrCode) {
    return NextResponse.json({ error: "QR code required" }, { status: 400 })
  }

  const registration = await prisma.registration.findFirst({
    where: {
      qrCode,
      eventId: params.id,
    },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      ticket: { select: { name: true } },
    },
  })

  if (!registration) {
    return NextResponse.json(
      { error: "Invalid QR code — no registration found for this event" },
      { status: 404 }
    )
  }

  if (registration.status === "CANCELLED") {
    return NextResponse.json(
      { error: "This registration has been cancelled", registration },
      { status: 400 }
    )
  }

  if (registration.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Registration is not confirmed (payment may be pending)", registration },
      { status: 400 }
    )
  }

  if (registration.checkedIn) {
    return NextResponse.json(
      {
        error: "Already checked in",
        checkedInAt: registration.checkedInAt,
        registration,
      },
      { status: 409 }
    )
  }

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { checkedIn: true, checkedInAt: new Date() },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      ticket: { select: { name: true } },
    },
  })

  return NextResponse.json({
    success: true,
    message: `${updated.user.name || updated.user.email} checked in!`,
    registration: updated,
  })
}
