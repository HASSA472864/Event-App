"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { CalendarDays, Users, DollarSign, Zap } from "lucide-react"

interface DashboardData {
  totalEvents: number
  upcomingEvents: any[]
  totalRegistrations: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ totalEvents: 0, upcomingEvents: [], totalRegistrations: 0, totalRevenue: 0 }))
  }, [])

  const stats = [
    { title: "Total Events", value: data?.totalEvents ?? 0, icon: CalendarDays, color: "from-violet-500 to-indigo-600", trend: "+12% this month" },
    { title: "Attendees", value: data?.totalRegistrations ?? 0, icon: Users, color: "from-emerald-500 to-teal-600", trend: "+8% this month" },
    { title: "Revenue", value: data?.totalRevenue ?? 0, icon: DollarSign, prefix: "$", color: "from-amber-500 to-orange-600", trend: "+23% this month" },
    { title: "Active Events", value: data?.upcomingEvents?.length ?? 0, icon: Zap, color: "from-pink-500 to-rose-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents events={data?.upcomingEvents ?? []} />
        </div>
        <ActivityFeed />
      </div>
    </div>
  )
}
