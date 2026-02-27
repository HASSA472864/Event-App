"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  LayoutGrid,
  List,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface EventFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  view: "grid" | "list"
  onViewChange: (value: "grid" | "list") => void
  categories?: Category[]
}

const statusOptions = [
  { value: "", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function EventFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  view,
  onViewChange,
  categories = [],
}: EventFiltersProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch, onSearchChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Search bar and view toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search events..."
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
          />
          {debouncedSearch && (
            <button
              onClick={() => {
                setDebouncedSearch("")
                onSearchChange("")
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-900/50 border border-white/10 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onViewChange("grid")}
            className={cn(
              "rounded-md transition-all",
              view === "grid"
                ? "bg-violet-500/20 text-violet-400"
                : "text-slate-500 hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onViewChange("list")}
            className={cn(
              "rounded-md transition-all",
              view === "list"
                ? "bg-violet-500/20 text-violet-400"
                : "text-slate-500 hover:text-white"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 uppercase tracking-wider mr-1">Status:</span>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              status === option.value
                ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                : "bg-slate-900/30 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wider mr-1">Category:</span>
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              categoryId === ""
                ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                : "bg-slate-900/30 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                categoryId === cat.id
                  ? "border-opacity-30"
                  : "bg-slate-900/30 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
              )}
              style={
                categoryId === cat.id
                  ? {
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                      borderColor: `${cat.color}40`,
                    }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
