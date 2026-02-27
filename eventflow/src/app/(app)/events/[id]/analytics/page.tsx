"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Users,
  DollarSign,
  Eye,
  UserCheck,
  TrendingUp,
  Ticket,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalRegistrations: number
    confirmedRegistrations: number
    checkedIn: number
    totalRevenue: number
    capacity: number | null
    conversionRate: string
    pageViews: number
    checkInRate: string
  }
  ticketBreakdown: {
    name: string
    sold: number
    total: number | null
    revenue: number
    price: number
  }[]
  registrationTrend: { date: string; count: number }[]
  revenueTrend: { date: string; amount: number }[]
}

const CHART_COLORS = ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"]

export default function EventAnalyticsPage() {
  const params = useParams()
  const eventId = params.id as string
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch(`/api/events/${eventId}/analytics`)
      if (res.ok) setData(await res.json())
      setLoading(false)
    }
    fetchAnalytics()
  }, [eventId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Analytics not available</p>
      </div>
    )
  }

  const overviewCards = [
    {
      label: "Total Registrations",
      value: data.overview.totalRegistrations,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Revenue",
      value: `$${data.overview.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Page Views",
      value: data.overview.pageViews,
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Check-in Rate",
      value: `${data.overview.checkInRate}%`,
      icon: UserCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ]

  const pieData = data.ticketBreakdown.map((t) => ({
    name: t.name,
    value: t.sold,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            Event Analytics
          </h1>
          <p className="text-slate-400 text-sm">Performance metrics and insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registration Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Registration Trend
        </h3>
        {data.registrationTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.registrationTrend}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
              />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                labelStyle={{ color: "#F1F5F9" }}
                itemStyle={{ color: "#A78BFA" }}
              />
              <Area type="monotone" dataKey="count" stroke="#7C3AED" fill="url(#colorReg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500">No data yet</div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Revenue
          </h3>
          {data.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#F1F5F9" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">No revenue data</div>
          )}
        </motion.div>

        {/* Ticket Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-violet-400" />
            Ticket Breakdown
          </h3>
          {pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">No tickets sold yet</div>
          )}

          <div className="space-y-2 mt-4">
            {data.ticketBreakdown.map((ticket, i) => (
              <div key={ticket.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-300">{ticket.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    {ticket.sold}/{ticket.total || "\u221e"}
                  </span>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    ${ticket.revenue.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
