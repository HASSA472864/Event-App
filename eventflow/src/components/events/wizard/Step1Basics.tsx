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
import { Type, Tag } from "lucide-react"
import { useEffect, useState } from "react"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

const defaultCategories: Category[] = [
  { id: "conference", name: "Conference", color: "#7C3AED", icon: "Mic" },
  { id: "workshop", name: "Workshop", color: "#2563EB", icon: "Wrench" },
  { id: "meetup", name: "Meetup", color: "#059669", icon: "Users" },
  { id: "webinar", name: "Webinar", color: "#D97706", icon: "Monitor" },
  { id: "social", name: "Social", color: "#DC2626", icon: "PartyPopper" },
  { id: "hackathon", name: "Hackathon", color: "#7C3AED", icon: "Code" },
  { id: "concert", name: "Concert", color: "#DB2777", icon: "Music" },
  { id: "sports", name: "Sports", color: "#16A34A", icon: "Trophy" },
  { id: "other", name: "Other", color: "#6B7280", icon: "MoreHorizontal" },
]

export function Step1Basics() {
  const { formData, updateFormData, stepValidation } = useWizard()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      })
      .catch(() => {
        // Use default categories on error
      })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Event Basics</h2>
        <p className="text-slate-400">
          Start with a compelling title and category for your event.
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Type className="h-4 w-4 text-violet-400" />
            Event Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Enter your event title..."
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20 h-12 text-lg"
          />
          {stepValidation.errors.title && (
            <p className="text-sm text-red-400">{stepValidation.errors.title}</p>
          )}
          <p className="text-xs text-slate-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Tag className="h-4 w-4 text-violet-400" />
            Category
          </Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => updateFormData({ categoryId: value })}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white h-12 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="text-white focus:bg-violet-500/20 focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Optional. Helps attendees discover your event.
          </p>
        </div>

        {/* Preview Card */}
        {formData.title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-6"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Preview</p>
            <h3 className="text-xl font-bold text-white">{formData.title}</h3>
            {formData.categoryId && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      categories.find((c) => c.id === formData.categoryId)?.color || "#7C3AED",
                  }}
                />
                <span className="text-sm text-slate-400">
                  {categories.find((c) => c.id === formData.categoryId)?.name}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
