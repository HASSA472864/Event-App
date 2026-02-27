"use client"

import { useWizard } from "./WizardContext"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  CalendarDays,
  Clock,
  Globe,
  MapPin,
  Video,
  Link as LinkIcon,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
]

const timeOptions: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    timeOptions.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    )
  }
}

function formatTimeTo12h(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

export function Step3DateTime() {
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
        <h2 className="text-2xl font-bold text-white">Date, Time & Location</h2>
        <p className="text-slate-400">
          When and where is your event happening?
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Pickers Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-violet-400" />
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:text-white",
                    !formData.startDate && "text-slate-500"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-violet-400" />
                  {formData.startDate
                    ? format(formData.startDate, "PPP")
                    : "Pick a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate || undefined}
                  onSelect={(date) => {
                    updateFormData({ startDate: date || null })
                    if (date && !formData.endDate) {
                      updateFormData({ endDate: date })
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            {stepValidation.errors.startDate && (
              <p className="text-sm text-red-400">{stepValidation.errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-violet-400" />
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:text-white",
                    !formData.endDate && "text-slate-500"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-violet-400" />
                  {formData.endDate
                    ? format(formData.endDate, "PPP")
                    : "Pick an end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate || undefined}
                  onSelect={(date) => updateFormData({ endDate: date || null })}
                  disabled={(date) => {
                    const today = new Date(new Date().setHours(0, 0, 0, 0))
                    if (formData.startDate) {
                      return date < formData.startDate
                    }
                    return date < today
                  }}
                />
              </PopoverContent>
            </Popover>
            {stepValidation.errors.endDate && (
              <p className="text-sm text-red-400">{stepValidation.errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Time Pickers Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" />
              Start Time
            </Label>
            <Select
              value={formData.startTime}
              onValueChange={(value) => updateFormData({ startTime: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white h-12 w-full">
                <SelectValue>
                  {formatTimeTo12h(formData.startTime)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem
                    key={`start-${time}`}
                    value={time}
                    className="text-white focus:bg-violet-500/20 focus:text-white"
                  >
                    {formatTimeTo12h(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" />
              End Time
            </Label>
            <Select
              value={formData.endTime}
              onValueChange={(value) => updateFormData({ endTime: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white h-12 w-full">
                <SelectValue>
                  {formatTimeTo12h(formData.endTime)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem
                    key={`end-${time}`}
                    value={time}
                    className="text-white focus:bg-violet-500/20 focus:text-white"
                  >
                    {formatTimeTo12h(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Globe className="h-4 w-4 text-violet-400" />
            Timezone
          </Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => updateFormData({ timezone: value })}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white h-12 w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
              {timezones.map((tz) => (
                <SelectItem
                  key={tz}
                  value={tz}
                  className="text-white focus:bg-violet-500/20 focus:text-white"
                >
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Virtual Event Toggle */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                formData.isVirtual
                  ? "bg-violet-500/20 text-violet-400"
                  : "bg-slate-700/50 text-slate-400"
              )}>
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Virtual Event</p>
                <p className="text-xs text-slate-500">
                  Host your event online with a meeting link
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateFormData({ isVirtual: !formData.isVirtual })}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                formData.isVirtual ? "bg-violet-500" : "bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.isVirtual ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Location or Meeting URL */}
        {formData.isVirtual ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-violet-400" />
              Meeting URL
            </Label>
            <Input
              value={formData.meetingUrl}
              onChange={(e) => updateFormData({ meetingUrl: e.target.value })}
              placeholder="https://zoom.us/j/..."
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 h-12"
            />
            {stepValidation.errors.meetingUrl && (
              <p className="text-sm text-red-400">{stepValidation.errors.meetingUrl}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-violet-400" />
              Location
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => updateFormData({ location: e.target.value })}
              placeholder="Enter venue address..."
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 h-12"
            />
            {stepValidation.errors.location && (
              <p className="text-sm text-red-400">{stepValidation.errors.location}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
