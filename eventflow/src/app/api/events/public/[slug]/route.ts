import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/events/public/[slug] — Public endpoint, no auth required
// Returns published event details by slug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const event = await prisma.event.findUnique({
    where: { slug },
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

  // Only show published, completed, or cancelled events publicly
  // Draft events should not be visible to the public
  if (event.status === "DRAFT") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  // Increment page views in analytics
  await prisma.eventAnalytics.updateMany({
    where: { eventId: event.id },
    data: { pageViews: { increment: 1 } },
  }).catch(() => {
    // Non-critical, silently fail if analytics record doesn't exist
  })

  return NextResponse.json(event)
}
