"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  UserPlus,
  X,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications")
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen, fetchNotifications])

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("payment") || title.toLowerCase().includes("revenue")) {
      return <CreditCard className="w-4 h-4 text-emerald-400" />
    }
    if (title.toLowerCase().includes("registration") || title.toLowerCase().includes("rsvp")) {
      return <UserPlus className="w-4 h-4 text-blue-400" />
    }
    if (title.toLowerCase().includes("event") || title.toLowerCase().includes("reminder")) {
      return <Calendar className="w-4 h-4 text-violet-400" />
    }
    return <Bell className="w-4 h-4 text-slate-400" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-96 max-h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white h-7 w-7">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => {
                    const content = (
                      <div
                        onClick={() => !notification.read && markRead(notification.id)}
                        className={`p-4 hover:bg-slate-800/30 transition-colors cursor-pointer border-b border-slate-800/30 ${
                          !notification.read ? "bg-violet-500/5" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">{getIcon(notification.title)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {notification.link && (
                            <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    )

                    return notification.link ? (
                      <Link key={notification.id} href={notification.link} onClick={onClose}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notification.id}>{content}</div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
