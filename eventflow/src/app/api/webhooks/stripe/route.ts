import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
  })
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const { eventId, ticketId, userId, quantity } = session.metadata || {}

    if (!eventId || !ticketId || !userId) {
      console.error("Missing metadata in checkout session")
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.registration.updateMany({
        where: {
          stripePaymentId: session.id,
          status: "PENDING",
        },
        data: {
          status: "CONFIRMED",
        },
      })

      await tx.ticket.update({
        where: { id: ticketId },
        data: { sold: { increment: parseInt(quantity || "1") } },
      })

      const eventData = await tx.event.findUnique({
        where: { id: eventId },
        select: { title: true, slug: true },
      })

      await tx.eventAnalytics.updateMany({
        where: { eventId },
        data: {
          totalRevenue: { increment: (session.amount_total || 0) / 100 },
        },
      })

      await tx.notification.create({
        data: {
          userId,
          title: "Payment Confirmed",
          message: `Your registration for ${eventData?.title} is confirmed!`,
          link: `/events/${eventData?.slug}`,
        },
      })
    })
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session
    await prisma.registration.updateMany({
      where: {
        stripePaymentId: session.id,
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    })
  }

  return NextResponse.json({ received: true })
}
