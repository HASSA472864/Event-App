"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Ticket,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: {
    id: string
    title: string
    slug: string
    coverImage?: string | null
    startDate: string
    endDate: string
    location?: string | null
    isVirtual: boolean
    status: string
    capacity?: number | null
    category?: { name: string; color: string; icon: string } | null
    tickets: { price: number }[]
    _count: { registrations: number }
  }
  index?: number
  view?: "grid" | "list"
}

function getPriceDisplay(tickets: { price: number }[]) {
  if (!tickets.length) return "Free"
  const prices = tickets.map((t) => t.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (max === 0) return "Free"
  if (min === max) return `$${min.toFixed(0)}`
  if (min === 0) return `Free - $${max.toFixed(0)}`
  return `$${min.toFixed(0)} - $${max.toFixed(0)}`
}

function getStatusColor(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "DRAFT":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "CANCELLED":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "COMPLETED":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

const coverGradients = [
  "from-violet-600 to-indigo-700",
  "from-pink-600 to-rose-700",
  "from-emerald-600 to-teal-700",
  "from-amber-600 to-orange-700",
  "from-cyan-600 to-blue-700",
  "from-fuchsia-600 to-purple-700",
]

function getGradient(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return coverGradients[Math.abs(hash) % coverGradients.length]
}

export function EventCard({ event, index = 0, view = "grid" }: EventCardProps) {
  const priceDisplay = getPriceDisplay(event.tickets)
  const isUpcoming = new Date(event.startDate) > new Date()
  const gradient = getGradient(event.id)

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/events/${event.slug}`}>
          <div className="group flex gap-4 p-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl hover:border-violet-500/30 hover:bg-slate-900/70 transition-all duration-300">
            {/* Thumbnail */}
            <div className="relative h-24 w-36 rounded-lg overflow-hidden shrink-0">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full bg-gradient-to-br flex items-center justify-center",
                    gradient
                  )}
                >
                  <Calendar className="h-8 w-8 text-white/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {event.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] shrink-0 border", getStatusColor(event.status))}
                  >
                    {event.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.startDate), "EEE, MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    {event.isVirtual ? (
                      <>
                        <Globe className="h-3 w-3" />
                        Virtual
                      </>
                    ) : event.location ? (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{event.location}</span>
                      </>
                    ) : null}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event._count.registrations} attendees
                </span>
                <span className="flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  {priceDisplay}
                </span>
                {event.category && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-slate-700/50"
                    style={{ color: event.category.color, borderColor: `${event.category.color}30` }}
                  >
                    {event.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/events/${event.slug}`}>
        <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1">
          {/* Cover Image */}
          <div className="relative h-44 overflow-hidden">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div
                className={cn(
                  "h-full w-full bg-gradient-to-br flex items-center justify-center",
                  gradient
                )}
              >
                <Calendar className="h-12 w-12 text-white/20" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Status badge (top left) */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] backdrop-blur-md border",
                  getStatusColor(event.status)
                )}
              >
                {event.status}
              </Badge>
            </div>

            {/* Category badge (top right) */}
            {event.category && (
              <div className="absolute top-3 right-3">
                <Badge
                  className="text-[10px] backdrop-blur-md border-0"
                  style={{
                    backgroundColor: `${event.category.color}20`,
                    color: event.category.color,
                  }}
                >
                  {event.category.name}
                </Badge>
              </div>
            )}

            {/* Price (bottom right) */}
            <div className="absolute bottom-3 right-3">
              <span className="text-sm font-bold text-white bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg">
                {priceDisplay}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4 text-violet-400 shrink-0" />
              <span>{format(new Date(event.startDate), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {event.isVirtual ? (
                <>
                  <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Virtual Event</span>
                </>
              ) : event.location ? (
                <>
                  <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="text-slate-600">Location TBD</span>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="h-3.5 w-3.5" />
                {event._count.registrations}
                {event.capacity ? ` / ${event.capacity}` : ""} attendees
              </span>
              {isUpcoming && (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
