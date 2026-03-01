"use client"

import { useWizard } from "./WizardContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Ticket,
  Users,
  Repeat,
  Send,
  Eye,
  Tag,
  FileText,
  Globe,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"

function formatTimeTo12h(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

/** Strip HTML tags to produce a safe plain-text preview of the description. */
function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div")
    tmp.textContent = html.replace(/<[^>]*>/g, " ")
    return tmp.textContent || ""
  }
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function ReviewSection({
  icon: Icon,
  title,
  children,
  onEdit,
}: {
  icon: any
  title: string
  children: React.ReactNode
  onEdit?: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  )
}

export function Step6Review() {
  const { formData, goToStep, isSubmitting, setIsSubmitting } = useWizard()
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const descriptionPreview = useMemo(
    () => stripHtml(formData.description),
    [formData.description]
  )

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    setIsSubmitting(true)
    setError("")

    try {
      // Combine date + time
      const startDate = new Date(formData.startDate!)
      const [sh, sm] = formData.startTime.split(":").map(Number)
      startDate.setHours(sh, sm, 0, 0)

      const endDate = new Date(formData.endDate!)
      const [eh, em] = formData.endTime.split(":").map(Number)
      endDate.setHours(eh, em, 0, 0)

      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        coverImage: formData.coverImage || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timezone: formData.timezone,
        location: formData.location || undefined,
        isVirtual: formData.isVirtual,
        meetingUrl: formData.isVirtual ? formData.meetingUrl : undefined,
        capacity: formData.capacity || undefined,
        isRecurring: formData.isRecurring,
        recurringRule: formData.isRecurring ? formData.recurringRule : undefined,
        tickets: formData.tickets.map((t) => ({
          name: t.name,
          price: t.isFree ? 0 : t.price,
          quantity: t.quantity || undefined,
          description: t.description || undefined,
        })),
        status,
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let message = "Failed to create event"
        try {
          const data = await res.json()
          message = data.error?.message || message
        } catch {
          // Response body was not valid JSON
        }
        throw new Error(message)
      }

      setSuccess(true)

      setTimeout(() => {
        router.push(`/events`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="p-4 rounded-full bg-emerald-500/20 mb-6"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Event Created!</h2>
        <p className="text-slate-400">
          Your event has been created successfully. Redirecting...
        </p>
      </motion.div>
    )
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
        <h2 className="text-2xl font-bold text-white">Review & Publish</h2>
        <p className="text-slate-400">
          Review all your event details before publishing.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 space-y-6">
        {/* Cover Image Preview */}
        {formData.coverImage && (
          <div className="rounded-xl overflow-hidden -mx-2 -mt-2 mb-4">
            <img
              src={formData.coverImage}
              alt="Cover"
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {/* Basics */}
        <ReviewSection icon={Tag} title="Event Basics" onEdit={() => goToStep(1)}>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{formData.title}</h3>
            {formData.categoryId && (
              <Badge
                variant="outline"
                className="border-violet-500/30 text-violet-400 text-xs"
              >
                {formData.categoryId}
              </Badge>
            )}
          </div>
        </ReviewSection>

        <Separator className="bg-slate-800/50" />

        {/* Description (rendered as safe plain text) */}
        <ReviewSection icon={FileText} title="Description" onEdit={() => goToStep(2)}>
          <p className="text-sm text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
            {descriptionPreview || "No description provided."}
          </p>
        </ReviewSection>

        <Separator className="bg-slate-800/50" />

        {/* Date & Time */}
        <ReviewSection icon={CalendarDays} title="Date & Time" onEdit={() => goToStep(3)}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              {formData.startDate
                ? format(formData.startDate, "EEEE, MMMM d, yyyy")
                : "Not set"}
              {formData.endDate &&
                formData.startDate &&
                formData.endDate.toDateString() !== formData.startDate.toDateString() && (
                  <span>
                    {" - "}
                    {format(formData.endDate, "EEEE, MMMM d, yyyy")}
                  </span>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {formatTimeTo12h(formData.startTime)} - {formatTimeTo12h(formData.endTime)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              {formData.timezone.replace(/_/g, " ")}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              {formData.isVirtual ? (
                <>
                  <Video className="h-3.5 w-3.5 text-slate-500" />
                  Virtual Event
                  {formData.meetingUrl && (
                    <span className="text-violet-400 text-xs truncate max-w-[200px]">
                      ({formData.meetingUrl})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {formData.location || "No location set"}
                </>
              )}
            </div>
          </div>
        </ReviewSection>

        <Separator className="bg-slate-800/50" />

        {/* Tickets */}
        <ReviewSection icon={Ticket} title="Tickets" onEdit={() => goToStep(4)}>
          <div className="space-y-2">
            {formData.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {ticket.name || "Unnamed"}
                  </p>
                  {ticket.description && (
                    <p className="text-xs text-slate-500">{ticket.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-violet-400">
                    {ticket.isFree ? "Free" : `$${ticket.price.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ticket.quantity ? `${ticket.quantity} spots` : "Unlimited"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>

        <Separator className="bg-slate-800/50" />

        {/* Settings */}
        <ReviewSection icon={Users} title="Settings" onEdit={() => goToStep(5)}>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              Capacity: {formData.capacity || "Unlimited"}
            </div>
            {formData.isRecurring && (
              <div className="flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5 text-slate-500" />
                Recurring: {formData.recurringRule}
              </div>
            )}
          </div>
        </ReviewSection>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Save as Draft
        </Button>
        <Button
          type="button"
          className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Publish Event
        </Button>
      </div>
    </motion.div>
  )
}
