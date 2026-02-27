"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Video,
  Plus,
} from "lucide-react"
import Link from "next/link"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  slug: string
  startDate: string
  endDate: string
  location: string | null
  isVirtual: boolean
  status: string
  coverImage: string | null
  category: { name: string; color: string } | null
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/events?limit=100`)
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      const dateKey = format(new Date(event.startDate), "yyyy-MM-dd")
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(event)
    })
    return map
  }, [events])

  const selectedDateEvents = selectedDate
    ? eventsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : []

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-violet-400" />
          Calendar
        </h1>
        <Link href="/events/create">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayEvents = eventsByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[80px] p-1.5 rounded-lg text-left transition-all border
                    ${isCurrentMonth ? "text-white" : "text-slate-600"}
                    ${isSelected
                      ? "bg-violet-500/10 border-violet-500/50"
                      : "border-transparent hover:bg-slate-800/30 hover:border-slate-700/30"
                    }
                    ${today && !isSelected ? "bg-slate-800/20" : ""}
                  `}
                >
                  <span
                    className={`text-sm font-medium ${
                      today
                        ? "bg-violet-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-[10px] leading-tight truncate px-1 py-0.5 rounded"
                        style={{
                          backgroundColor: event.category?.color
                            ? `${event.category.color}20`
                            : "#7C3AED20",
                          color: event.category?.color || "#A78BFA",
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-slate-500 px-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Selected Date Events */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
          </h3>

          {!selectedDate ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Click on a date to see events</p>
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-3">No events on this date</p>
              <Link href="/events/create">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Plus className="w-3 h-3 mr-1" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{event.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {format(new Date(event.startDate), "h:mm a")} -{" "}
                          {format(new Date(event.endDate), "h:mm a")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {event.isVirtual ? (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Virtual
                            </Badge>
                          ) : event.location ? (
                            <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </Badge>
                          ) : null}
                          {event.category && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: `${event.category.color}50`,
                                color: event.category.color,
                              }}
                            >
                              {event.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={`text-xs ${
                          event.status === "PUBLISHED"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {event.status === "PUBLISHED" ? "Live" : "Draft"}
                      </Badge>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
