"use client"

import { useWizard } from "./WizardContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { Users, Repeat, Eye, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const recurringOptions = [
  { value: "daily", label: "Daily", description: "Repeats every day" },
  { value: "weekly", label: "Weekly", description: "Repeats every week" },
  { value: "biweekly", label: "Bi-weekly", description: "Repeats every two weeks" },
  { value: "monthly", label: "Monthly", description: "Repeats every month" },
]

export function Step5Settings() {
  const { formData, updateFormData, stepValidation } = useWizard()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Event Settings</h2>
        <p className="text-slate-400">
          Configure capacity, recurrence, and publishing options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Capacity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-400" />
            Event Capacity
          </Label>
          <Input
            type="number"
            min={1}
            value={formData.capacity ?? ""}
            onChange={(e) =>
              updateFormData({
                capacity: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Leave blank for unlimited"
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 h-12"
          />
          <p className="text-xs text-slate-500">
            Maximum number of attendees. Leave blank for no limit.
          </p>
        </div>

        {/* Recurring Toggle */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  formData.isRecurring
                    ? "bg-violet-500/20 text-violet-400"
                    : "bg-slate-700/50 text-slate-400"
                )}
              >
                <Repeat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Recurring Event</p>
                <p className="text-xs text-slate-500">
                  Automatically repeat this event on a schedule
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                updateFormData({
                  isRecurring: !formData.isRecurring,
                  recurringRule: !formData.isRecurring ? "" : formData.recurringRule,
                })
              }
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                formData.isRecurring ? "bg-violet-500" : "bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.isRecurring ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {formData.isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-xs text-slate-400">Repeat Schedule</Label>
              <div className="grid grid-cols-2 gap-2">
                {recurringOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateFormData({ recurringRule: option.value })
                    }
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      formData.recurringRule === option.value
                        ? "border-violet-500/50 bg-violet-500/10 text-white"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600/50 hover:text-white"
                    )}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
              {stepValidation.errors.recurringRule && (
                <p className="text-sm text-red-400">
                  {stepValidation.errors.recurringRule}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Event Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-300">
            Publishing Status
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateFormData({ status: "DRAFT" })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all flex items-start gap-3",
                formData.status === "DRAFT"
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  formData.status === "DRAFT"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-slate-700/50 text-slate-400"
                )}
              >
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    formData.status === "DRAFT"
                      ? "text-amber-400"
                      : "text-slate-400"
                  )}
                >
                  Save as Draft
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save your progress and publish later. Only you can see the
                  event.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateFormData({ status: "PUBLISHED" })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all flex items-start gap-3",
                formData.status === "PUBLISHED"
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  formData.status === "PUBLISHED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700/50 text-slate-400"
                )}
              >
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    formData.status === "PUBLISHED"
                      ? "text-emerald-400"
                      : "text-slate-400"
                  )}
                >
                  Publish Immediately
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Make the event visible to everyone right away.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
