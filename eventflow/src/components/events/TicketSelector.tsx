"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Ticket,
  Minus,
  Plus,
  CreditCard,
  CheckCircle2,
  Loader2,
  PartyPopper,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface TicketTier {
  id: string
  name: string
  description?: string | null
  price: number
  quantity?: number | null
  sold: number
}

interface TicketSelectorProps {
  tickets: TicketTier[]
  eventId: string
  eventSlug: string
}

export default function TicketSelector({
  tickets,
  eventId,
  eventSlug,
}: TicketSelectorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/events/${eventSlug}`)
      return
    }

    if (!selectedTicket) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, ticketId: selectedTicket, quantity }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center"
      >
        <PartyPopper className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">You&apos;re In!</h3>
        <p className="text-slate-400">Registration confirmed. Check your email for details.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Ticket className="w-5 h-5 text-violet-400" />
        Select Tickets
      </h3>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-2">
        {tickets.map((ticket) => {
          const available = ticket.quantity ? ticket.quantity - ticket.sold : null
          const soldOut = available !== null && available <= 0
          const isSelected = selectedTicket === ticket.id

          return (
            <motion.button
              key={ticket.id}
              whileHover={!soldOut ? { scale: 1.01 } : undefined}
              whileTap={!soldOut ? { scale: 0.99 } : undefined}
              onClick={() => {
                if (soldOut) return
                setSelectedTicket(isSelected ? null : ticket.id)
                setQuantity(1)
              }}
              disabled={soldOut}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? "bg-violet-500/10 border-violet-500/50 ring-1 ring-violet-500/30"
                  : soldOut
                  ? "bg-slate-900/30 border-slate-800/30 opacity-50 cursor-not-allowed"
                  : "bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{ticket.name}</span>
                    {soldOut && (
                      <Badge variant="outline" className="text-red-400 border-red-400/30 text-xs">
                        Sold Out
                      </Badge>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-sm text-slate-400 mt-1">{ticket.description}</p>
                  )}
                  {available !== null && !soldOut && (
                    <p className="text-xs text-slate-500 mt-1">{available} remaining</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">
                    {ticket.price === 0 ? "Free" : `$${ticket.price.toFixed(2)}`}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-violet-400 ml-auto mt-1" />
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <span className="text-sm text-slate-400">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(() => {
                const ticket = tickets.find((t) => t.id === selectedTicket)
                const total = (ticket?.price || 0) * quantity
                return (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total</span>
                    <span className="text-xl font-bold text-white">
                      {total === 0 ? "Free" : `$${total.toFixed(2)}`}
                    </span>
                  </div>
                )
              })()}

              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {tickets.find((t) => t.id === selectedTicket)?.price === 0 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Register Now
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </>
                )}
              </Button>

              {!session && (
                <p className="text-xs text-slate-500 text-center">
                  You&apos;ll need to sign in to complete registration
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
