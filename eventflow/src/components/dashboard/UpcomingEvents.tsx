"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface EventItem {
  id: string
  title: string
  startDate: string
  location?: string | null
  isVirtual: boolean
  category?: { name: string; color: string } | null
  _count: { registrations: number }
}

export function UpcomingEvents({ events }: { events: EventItem[] }) {
  if (!events.length) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
        <CardHeader><CardTitle className="text-white">Upcoming Events</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No upcoming events</p>
            <Link href="/events/create" className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">Create your first event</Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Upcoming Events</CardTitle>
        <Link href="/events" className="text-sm text-violet-400 hover:text-violet-300">View all</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="block">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{event.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </span>
                  {event.location && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{event.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3" />{event._count.registrations}
                </span>
                {event.category && (
                  <Badge variant="outline" className="text-[10px] border-slate-700" style={{ color: event.category.color }}>
                    {event.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
