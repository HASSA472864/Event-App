"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Download,
  Mail,
  MoreVertical,
  QrCode,
  ArrowLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Attendee {
  id: string
  status: string
  checkedIn: boolean
  checkedInAt: string | null
  qrCode: string
  createdAt: string
  user: { id: string; name: string | null; email: string; avatar: string | null }
  ticket: { name: string; price: number } | null
}

interface Stats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  checkedIn: number
}

export default function ManageAttendeesPage() {
  const params = useParams()
  const eventId = params.id as string
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, pending: 0, cancelled: 0, checkedIn: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAttendees = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "all") params.set("status", statusFilter.toUpperCase())

    const res = await fetch(`/api/events/${eventId}/attendees?${params}`)
    if (res.ok) {
      const data = await res.json()
      setAttendees(data.registrations)
      setStats(data.stats)
    }
    setLoading(false)
  }, [eventId, search, statusFilter])

  useEffect(() => {
    fetchAttendees()
  }, [fetchAttendees])

  const handleAction = async (registrationId: string, action: string) => {
    setActionLoading(registrationId)
    await fetch(`/api/events/${eventId}/attendees`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, action }),
    })
    await fetchAttendees()
    setActionLoading(null)
  }

  const exportCSV = () => {
    const headers = ["Name", "Email", "Ticket", "Status", "Checked In", "Registration Date"]
    const rows = attendees.map((a) => [
      a.user.name || "N/A",
      a.user.email,
      a.ticket?.name || "N/A",
      a.status,
      a.checkedIn ? "Yes" : "No",
      new Date(a.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendees-${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusBadge = (status: string, checkedIn: boolean) => {
    if (checkedIn) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Checked In</Badge>
    }
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const statCards = [
    { label: "Total", value: stats.total, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Checked In", value: stats.checkedIn, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events`}>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Attendees</h1>
          <p className="text-slate-400 text-sm">View and manage event registrations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-violet-600">All</TabsTrigger>
              <TabsTrigger value="confirmed" className="data-[state=active]:bg-violet-600">Confirmed</TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-violet-600">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportCSV} className="border-slate-700 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : attendees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No attendees yet</h3>
            <p className="text-slate-400 text-sm">Registrations will appear here once people sign up</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {attendees.map((attendee, index) => (
                <motion.div
                  key={attendee.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {attendee.user.name?.charAt(0)?.toUpperCase() || attendee.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{attendee.user.name || "Unnamed"}</p>
                      <p className="text-sm text-slate-400">{attendee.user.email}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-4">
                    {attendee.ticket && (
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {attendee.ticket.name}
                        {attendee.ticket.price > 0 && ` · $${attendee.ticket.price}`}
                      </Badge>
                    )}
                    {statusBadge(attendee.status, attendee.checkedIn)}
                    <span className="text-xs text-slate-500">
                      {new Date(attendee.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={actionLoading === attendee.id}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                      {attendee.status === "CONFIRMED" && !attendee.checkedIn && (
                        <DropdownMenuItem onClick={() => handleAction(attendee.id, "checkin")} className="text-emerald-400">
                          <QrCode className="w-4 h-4 mr-2" />
                          Check In
                        </DropdownMenuItem>
                      )}
                      {attendee.status === "PENDING" && (
                        <DropdownMenuItem onClick={() => handleAction(attendee.id, "confirm")} className="text-blue-400">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm
                        </DropdownMenuItem>
                      )}
                      {attendee.status !== "CANCELLED" && (
                        <DropdownMenuItem onClick={() => handleAction(attendee.id, "cancel")} className="text-red-400">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Registration
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-slate-300">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
