import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/events/[id] — Returns full event with tickets, organizer, category, registration count
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      category: true,
      tickets: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          quantity: true,
          sold: true,
          salesStart: true,
          salesEnd: true,
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  })

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  return NextResponse.json(event)
}

// PATCH /api/events/[id] — Update event (owner only)
const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().optional(),
  location: z.string().optional().nullable(),
  isVirtual: z.boolean().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")).nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const existing = await prisma.event.findUnique({
    where: { id },
    select: { organizerId: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (existing.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: any = { ...parsed.data }

  if (data.startDate) {
    data.startDate = new Date(data.startDate)
  }
  if (data.endDate) {
    data.endDate = new Date(data.endDate)
  }

  const updated = await prisma.event.update({
    where: { id },
    data,
    include: {
      category: true,
      tickets: true,
      _count: { select: { registrations: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/events/[id] — Delete event (owner only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { organizerId: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (existing.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.event.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
