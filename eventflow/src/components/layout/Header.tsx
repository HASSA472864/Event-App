"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/events": "Events",
  "/events/create": "Create Event",
  "/calendar": "Calendar",
  "/profile": "Profile",
  "/settings": "Settings",
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ||
    (pathname.includes("/analytics") ? "Analytics" :
     pathname.includes("/attendees") ? "Attendees" :
     pathname.includes("/checkin") ? "Check-in" :
     pathname.includes("/manage") ? "Manage Event" : "EventFlow")

  return (
    <header className="h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search events..."
            className="w-64 pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-500 text-[10px] p-0 flex items-center justify-center border-2 border-slate-950">3</Badge>
        </Button>
        <Link href="/events/create">
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Event</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
