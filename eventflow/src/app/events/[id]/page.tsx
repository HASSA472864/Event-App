"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  Clock,
  Copy,
  Check,
  Minus,
  Plus,
  Ticket,
  ArrowLeft,
  ExternalLink,
  Twitter,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketType {
  id: string
  name: string
  description?: string | null
  price: number
  quantity?: number | null
  sold: number
  salesStart?: string | null
  salesEnd?: string | null
}

interface EventDetail {
  id: string
  title: string
  slug: string
  description: string
  coverImage?: string | null
  startDate: string
  endDate: string
  timezone: string
  location?: string | null
  isVirtual: boolean
  meetingUrl?: string | null
  status: string
  capacity?: number | null
  organizer: {
    id: string
    name?: string | null
    email: string
    avatar?: string | null
  }
  category?: { id: string; name: string; color: string; icon: string } | null
  tickets: TicketType[]
  _count: { registrations: number }
}

const coverGradients = [
  "from-violet-600 via-indigo-700 to-purple-800",
  "from-pink-600 via-rose-700 to-fuchsia-800",
  "from-emerald-600 via-teal-700 to-cyan-800",
]

function getGradient(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return coverGradients[Math.abs(hash) % coverGradients.length]
}

/**
 * Basic HTML sanitizer that strips all tags except safe formatting tags.
 * For production, consider using DOMPurify or a similar library.
 */
function sanitizeHtml(html: string): string {
  const allowedTags = [
    "p", "br", "b", "i", "em", "strong", "u", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "a", "blockquote", "code", "pre",
  ]
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi
  return html.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // For anchor tags, only keep href attribute
      if (tagName.toLowerCase() === "a") {
        const hrefMatch = match.match(/href="([^"]*)"/)
        if (hrefMatch) {
          const href = hrefMatch[1]
          // Only allow http(s) and mailto links
          if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
            return match.startsWith("</") ? "</a>" : `<a href="${href}" target="_blank" rel="noopener noreferrer">`
          }
        }
        return match.startsWith("</") ? "</a>" : ""
      }
      return match
    }
    return ""
  })
}

function TicketSelector({
  ticket,
  quantity,
  onChange,
}: {
  ticket: TicketType
  quantity: number
  onChange: (qty: number) => void
}) {
  const remaining = ticket.quantity != null ? ticket.quantity - ticket.sold : null
  const isSoldOut = remaining !== null && remaining <= 0
  const maxQty = remaining !== null ? Math.min(remaining, 10) : 10

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all",
        quantity > 0
          ? "bg-violet-500/10 border-violet-500/30"
          : "bg-slate-900/30 border-white/10 hover:border-white/20"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white text-sm">{ticket.name}</h4>
          {isSoldOut && (
            <Badge className="text-[10px] bg-red-500/20 text-red-400 border-0">
              Sold Out
            </Badge>
          )}
        </div>
        {ticket.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ticket.description}</p>
        )}
        <p className="text-sm font-semibold text-violet-400 mt-1">
          {ticket.price === 0 ? "Free" : `$${ticket.price.toFixed(2)}`}
        </p>
        {remaining !== null && !isSoldOut && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            {remaining} remaining
          </p>
        )}
      </div>

      {!isSoldOut && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={() => onChange(Math.max(0, quantity - 1))}
            disabled={quantity <= 0}
            className="h-8 w-8 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-medium text-white w-6 text-center">
            {quantity}
          </span>
          <button
            onClick={() => onChange(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 hover:bg-violet-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? `${window.location.origin}/events/${slug}` : ""

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${title}!`
  )}&url=${encodeURIComponent(url)}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out ${title}! ${url}`
  )}`

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="h-9 w-9 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
        title="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  )
}

// Minimal public nav bar
function PublicNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              EventFlow
            </span>
          </Link>
          <Link href="/auth/login">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/50 hover:text-white"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-16">
      <PublicNav />
      {/* Hero skeleton */}
      <div className="relative h-[350px] sm:h-[420px]">
        <Skeleton className="h-full w-full bg-slate-800/50" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4 bg-slate-800/50" />
            <Skeleton className="h-6 w-1/2 bg-slate-800/50" />
            <Skeleton className="h-40 w-full bg-slate-800/50 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-80 w-full bg-slate-800/50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublicEventPage() {
  const params = useParams()
  const slug = params.id as string

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!slug) return

    // Fetch event by slug via the public endpoint
    fetch(`/api/events/public/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found")
        return res.json()
      })
      .then((data) => {
        setEvent(data)
        // Initialize ticket quantities
        const initial: Record<string, number> = {}
        data.tickets?.forEach((t: TicketType) => {
          initial[t.id] = 0
        })
        setTicketQuantities(initial)
      })
      .catch(() => setError("Event not found"))
      .finally(() => setLoading(false))
  }, [slug])

  // Memoize sanitized description to avoid re-sanitizing on every render
  const sanitizedDescription = useMemo(() => {
    if (!event?.description) return ""
    return sanitizeHtml(event.description)
  }, [event?.description])

  if (loading) return <LoadingSkeleton />

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PublicNav />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-20 w-20 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
            <p className="text-slate-500 mb-6">
              The event you are looking for does not exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const totalRegistrations = event._count.registrations
  const totalCapacity = event.capacity
  const spotsRemaining = totalCapacity ? totalCapacity - totalRegistrations : null
  const isEventPast = new Date(event.endDate) < new Date()
  const isCancelled = event.status === "CANCELLED"
  const gradient = getGradient(event.id)

  const totalSelectedTickets = Object.values(ticketQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  )
  const totalPrice = event.tickets.reduce((sum, ticket) => {
    return sum + ticket.price * (ticketQuantities[ticket.id] || 0)
  }, 0)

  const handleRegister = () => {
    // In a full implementation, this would redirect to checkout/registration
    const selected = Object.entries(ticketQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketId, quantity]) => ({ ticketId, quantity }))

    if (selected.length === 0 && event.tickets.length > 0) return

    // Redirect to login with a callback back to this event page
    window.location.href = `/auth/login?callbackUrl=/events/${event.slug}`
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicNav />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-[350px] sm:h-[420px] mt-16"
      >
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "h-full w-full bg-gradient-to-br",
              gradient
            )}
          />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 to-transparent" />
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Event details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {event.category && (
                  <Badge
                    className="text-xs border-0"
                    style={{
                      backgroundColor: `${event.category.color}20`,
                      color: event.category.color,
                    }}
                  >
                    {event.category.name}
                  </Badge>
                )}
                {isEventPast && (
                  <Badge className="text-xs bg-slate-500/20 text-slate-400 border-0">
                    Past Event
                  </Badge>
                )}
                {isCancelled && (
                  <Badge className="text-xs bg-red-500/20 text-red-400 border-0">
                    Cancelled
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {event.title}
              </h1>
            </motion.div>

            {/* Date, Location, Attendees row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")} ({event.timezone})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
                    event.isVirtual
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-rose-500/10 border-rose-500/20"
                  )}
                >
                  {event.isVirtual ? (
                    <Globe className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <MapPin className="h-5 w-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {event.isVirtual ? "Virtual Event" : event.location || "Location TBD"}
                  </p>
                  {event.isVirtual && (
                    <p className="text-xs text-slate-400">Online via video call</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {totalRegistrations} attendee{totalRegistrations !== 1 ? "s" : ""}
                  </p>
                  {spotsRemaining !== null && (
                    <p className="text-xs text-slate-400">
                      {spotsRemaining > 0
                        ? `${spotsRemaining} spots remaining`
                        : "Fully booked"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold text-white mb-4">About This Event</h2>
              {/* Description content is from the organizer's TipTap editor and sanitized before rendering */}
              <div
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-white prose-headings:font-semibold
                  prose-p:text-slate-300 prose-p:leading-relaxed
                  prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white
                  prose-ul:text-slate-300 prose-ol:text-slate-300
                  prose-li:marker:text-slate-500"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </motion.div>

            {/* Location section for physical events */}
            {!event.isVirtual && event.location && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white">{event.location}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
                    >
                      Open in Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Organizer</h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer.avatar || ""} />
                  <AvatarFallback className="bg-violet-500/20 text-violet-400 font-semibold">
                    {event.organizer.name?.charAt(0) || "O"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {event.organizer.name || "Event Organizer"}
                  </p>
                  <p className="text-sm text-slate-500">{event.organizer.email}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column: Ticket selection panel (sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {event.tickets.length > 0 ? "Get Tickets" : "Registration"}
                    </h3>
                    <ShareButtons title={event.title} slug={event.slug} />
                  </div>
                  {!isEventPast && !isCancelled && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(event.startDate), "MMM d")} -{" "}
                        {format(new Date(event.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ticket list */}
                <div className="p-4 space-y-3">
                  {isEventPast ? (
                    <div className="text-center py-6">
                      <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">This event has already ended.</p>
                    </div>
                  ) : isCancelled ? (
                    <div className="text-center py-6">
                      <Calendar className="h-10 w-10 text-red-500/40 mx-auto mb-3" />
                      <p className="text-sm text-red-400">This event has been cancelled.</p>
                    </div>
                  ) : event.tickets.length > 0 ? (
                    event.tickets.map((ticket) => (
                      <TicketSelector
                        key={ticket.id}
                        ticket={ticket}
                        quantity={ticketQuantities[ticket.id] || 0}
                        onChange={(qty) =>
                          setTicketQuantities((prev) => ({
                            ...prev,
                            [ticket.id]: qty,
                          }))
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Ticket className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        Free registration -- no tickets required
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {!isEventPast && !isCancelled && (
                  <div className="p-4 pt-0 space-y-3">
                    {totalSelectedTickets > 0 && (
                      <div className="flex items-center justify-between px-1 text-sm">
                        <span className="text-slate-400">
                          {totalSelectedTickets} ticket{totalSelectedTickets !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold text-white">
                          {totalPrice === 0 ? "Free" : `$${totalPrice.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={handleRegister}
                      disabled={event.tickets.length > 0 && totalSelectedTickets === 0}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {event.tickets.length > 0
                        ? totalPrice > 0
                          ? `Get Tickets - $${totalPrice.toFixed(2)}`
                          : totalSelectedTickets > 0
                          ? "Register Now"
                          : "Select Tickets"
                        : "Register for Free"}
                    </Button>

                    {spotsRemaining !== null && spotsRemaining > 0 && spotsRemaining <= 20 && (
                      <p className="text-center text-xs text-amber-400">
                        Only {spotsRemaining} spots left!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
