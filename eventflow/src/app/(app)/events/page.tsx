"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { EventCard } from "@/components/events/EventCard"
import { EventFilters } from "@/components/events/EventFilters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EventData {
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
  category?: { id: string; name: string; color: string; icon: string } | null
  tickets: { price: number }[]
  _count: { registrations: number }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "12")

      if (search) params.set("search", search)
      if (categoryId) params.set("categoryId", categoryId)

      // Handle status filter: "upcoming" and "past" are custom filters,
      // while "DRAFT", "PUBLISHED", "CANCELLED" are Prisma status values
      if (status === "upcoming") {
        params.set("status", "PUBLISHED")
      } else if (status === "past") {
        params.set("status", "COMPLETED")
      } else if (status) {
        params.set("status", status)
      }

      const res = await fetch(`/api/events?${params.toString()}`)
      const data = await res.json()

      let filteredEvents = data.events || []

      // Client-side filtering for upcoming/past based on date
      if (status === "upcoming") {
        filteredEvents = filteredEvents.filter(
          (e: EventData) => new Date(e.startDate) > new Date()
        )
      } else if (status === "past") {
        filteredEvents = filteredEvents.filter(
          (e: EventData) => new Date(e.endDate) < new Date()
        )
      }

      setEvents(filteredEvents)
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 })
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [search, status, categoryId, page])

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, status, categoryId])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and monitor all your events in one place.
          </p>
        </div>
        <Link href="/events/create">
          <Button className="h-10 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        view={view}
        onViewChange={setView}
        categories={categories}
      />

      {/* Loading state */}
      {loading && (
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
            >
              <Skeleton className="h-44 w-full bg-slate-800/50" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-slate-800/50" />
                <Skeleton className="h-4 w-1/2 bg-slate-800/50" />
                <Skeleton className="h-4 w-2/3 bg-slate-800/50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events grid/list */}
      {!loading && events.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${page}-${status}-${categoryId}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-3"
            )}
          >
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                view={view}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="h-20 w-20 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
          <p className="text-slate-500 text-sm text-center max-w-md mb-6">
            {search || status || categoryId
              ? "Try adjusting your filters or search terms to find what you're looking for."
              : "You haven't created any events yet. Get started by creating your first event."}
          </p>
          {!search && !status && !categoryId && (
            <Link href="/events/create">
              <Button className="h-10 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          )}
          {(search || status || categoryId) && (
            <Button
              variant="outline"
              className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300"
              onClick={() => {
                setSearch("")
                setStatus("")
                setCategoryId("")
              }}
            >
              Clear All Filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.totalPages <= 7) return true
                if (p === 1 || p === pagination.totalPages) return true
                if (Math.abs(p - page) <= 1) return true
                return false
              })
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                return (
                  <div key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-slate-600">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                        p === page
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      {p}
                    </button>
                  </div>
                )
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
