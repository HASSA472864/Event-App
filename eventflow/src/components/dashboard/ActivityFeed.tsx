"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Ticket, CheckCircle2, Calendar } from "lucide-react"

const mockActivity = [
  { id: 1, icon: UserPlus, text: "New registration for Tech Conference", time: "2 min ago", color: "text-emerald-400" },
  { id: 2, icon: Ticket, text: "VIP ticket purchased — $149", time: "15 min ago", color: "text-violet-400" },
  { id: 3, icon: CheckCircle2, text: "John Doe checked in at Workshop", time: "1 hour ago", color: "text-blue-400" },
  { id: 4, icon: Calendar, text: "New event published: Team Meetup", time: "3 hours ago", color: "text-amber-400" },
]

export function ActivityFeed() {
  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
      <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {mockActivity.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5"><item.icon className={`h-4 w-4 ${item.color}`} /></div>
            <div className="flex-1">
              <p className="text-sm text-slate-300">{item.text}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
