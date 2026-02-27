"use client"

import { useWizard, TicketTier } from "./WizardContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  Ticket,
  Plus,
  Trash2,
  DollarSign,
  Users,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Step4Tickets() {
  const { formData, updateFormData, stepValidation } = useWizard()

  const addTicket = () => {
    const newTicket: TicketTier = {
      id: crypto.randomUUID(),
      name: "",
      price: 0,
      quantity: null,
      description: "",
      isFree: true,
    }
    updateFormData({ tickets: [...formData.tickets, newTicket] })
  }

  const removeTicket = (id: string) => {
    if (formData.tickets.length <= 1) return
    updateFormData({
      tickets: formData.tickets.filter((t) => t.id !== id),
    })
  }

  const updateTicket = (id: string, updates: Partial<TicketTier>) => {
    updateFormData({
      tickets: formData.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })
  }

  const toggleFree = (id: string, isFree: boolean) => {
    updateTicket(id, { isFree, price: isFree ? 0 : 10 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Ticket Tiers</h2>
        <p className="text-slate-400">
          Set up your ticket options. You can have free or paid tiers.
        </p>
      </div>

      {stepValidation.errors.tickets && (
        <p className="text-sm text-red-400">{stepValidation.errors.tickets}</p>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {formData.tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-600" />
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-violet-500/20 flex items-center justify-center">
                          <Ticket className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          Tier {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Free/Paid Toggle */}
                      <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => toggleFree(ticket.id, true)}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                            ticket.isFree
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          Free
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFree(ticket.id, false)}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                            !ticket.isFree
                              ? "bg-violet-500/20 text-violet-400"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          Paid
                        </button>
                      </div>

                      {formData.tickets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                          onClick={() => removeTicket(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">
                        Ticket Name
                      </Label>
                      <Input
                        value={ticket.name}
                        onChange={(e) =>
                          updateTicket(ticket.id, { name: e.target.value })
                        }
                        placeholder="e.g. General Admission, VIP"
                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 h-10"
                      />
                      {stepValidation.errors[`ticket_${index}_name`] && (
                        <p className="text-xs text-red-400">
                          {stepValidation.errors[`ticket_${index}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={ticket.isFree ? 0 : ticket.price}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={ticket.isFree}
                          className={cn(
                            "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 h-10 pl-9",
                            ticket.isFree && "opacity-50 cursor-not-allowed"
                          )}
                        />
                      </div>
                      {stepValidation.errors[`ticket_${index}_price`] && (
                        <p className="text-xs text-red-400">
                          {stepValidation.errors[`ticket_${index}_price`]}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">
                        Quantity (leave blank for unlimited)
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="number"
                          min={1}
                          value={ticket.quantity ?? ""}
                          onChange={(e) =>
                            updateTicket(ticket.id, {
                              quantity: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          placeholder="Unlimited"
                          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 h-10 pl-9"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">
                        Description (optional)
                      </Label>
                      <Input
                        value={ticket.description}
                        onChange={(e) =>
                          updateTicket(ticket.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="What's included..."
                        className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 h-10"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Ticket Button */}
        <motion.div layout>
          <Button
            type="button"
            variant="outline"
            onClick={addTicket}
            className="w-full h-12 border-dashed border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 hover:border-violet-500/30 text-slate-400 hover:text-violet-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Tier
          </Button>
        </motion.div>

        {/* Summary */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Ticket Summary
          </p>
          <div className="space-y-2">
            {formData.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-300">
                  {ticket.name || "Unnamed Ticket"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    {ticket.quantity ? `${ticket.quantity} available` : "Unlimited"}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      ticket.isFree
                        ? "text-emerald-400"
                        : "text-violet-400"
                    )}
                  >
                    {ticket.isFree ? "Free" : `$${ticket.price.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
