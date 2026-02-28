import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
})

const registerSchema = z.object({
  eventId: z.string(),
  ticketId: z.string(),
  quantity: z.number().int().positive().default(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { eventId, ticketId, quantity } = parsed.data

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { tickets: true },
  })

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Event not found or not available" }, { status: 404 })
  }

  const ticket = event.tickets.find((t) => t.id === ticketId)
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  if (ticket.quantity && ticket.sold + quantity > ticket.quantity) {
    return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 })
  }

  if (event.capacity) {
    const currentRegistrations = await prisma.registration.count({
      where: { eventId, status: { in: ["CONFIRMED", "PENDING"] } },
    })
    if (currentRegistrations + quantity > event.capacity) {
      return NextResponse.json({ error: "Event is at capacity" }, { status: 400 })
    }
  }

  const existing = await prisma.registration.findFirst({
    where: { eventId, userId: session.user.id, status: { not: "CANCELLED" } },
  })
  if (existing) {
    return NextResponse.json({ error: "Already registered for this event" }, { status: 409 })
  }

  if (ticket.price === 0) {
    const registration = await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { sold: { increment: quantity } },
      })

      const reg = await tx.registration.create({
        data: {
          eventId,
          userId: session.user.id,
          ticketId,
          status: "CONFIRMED",
        },
      })

      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: "Registration Confirmed",
          message: `You're registered for ${event.title}!`,
          link: `/events/${event.slug}`,
        },
      })

      return reg
    })

    return NextResponse.json(registration, { status: 201 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: session.user.email || undefined,
    metadata: {
      eventId,
      ticketId,
      userId: session.user.id,
      quantity: quantity.toString(),
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${event.title} - ${ticket.name}`,
            description: ticket.description || undefined,
          },
          unit_amount: Math.round(ticket.price * 100),
        },
        quantity,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}?registration=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}?registration=cancelled`,
  })

  const registration = await prisma.registration.create({
    data: {
      eventId,
      userId: session.user.id,
      ticketId,
      status: "PENDING",
      stripePaymentId: checkoutSession.id,
    },
  })

  return NextResponse.json(
    { registration, checkoutUrl: checkoutSession.url },
    { status: 201 }
  )
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: {
      event: { include: { category: true } },
      ticket: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(registrations)
}
