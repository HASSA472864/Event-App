import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { z } from "zod"

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string(),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  capacity: z.number().int().positive().optional(),
  isRecurring: z.boolean().default(false),
  recurringRule: z.string().optional(),
  tickets: z.array(
    z.object({
      name: z.string(),
      price: z.number().min(0),
      quantity: z.number().int().positive().optional(),
      description: z.string().optional(),
    })
  ),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { tickets, ...eventData } = parsed.data

  const event = await prisma.event.create({
    data: {
      ...eventData,
      slug: slugify(eventData.title),
      organizerId: session.user.id,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      tickets: { create: tickets },
      analytics: { create: {} },
    },
    include: { tickets: true },
  })

  return NextResponse.json(event, { status: 201 })
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const categoryId = searchParams.get("categoryId")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  const where: any = {
    organizerId: session.user.id,
  }

  if (status) {
    where.status = status
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: true,
        tickets: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
