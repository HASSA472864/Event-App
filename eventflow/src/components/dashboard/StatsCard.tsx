"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  prefix?: string
  suffix?: string
  trend?: string
  color: string
}

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`)

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" })
    return controls.stop
  }, [count, value])

  return <motion.span>{rounded}</motion.span>
}

export function StatsCard({ title, value, icon: Icon, prefix, suffix, trend, color }: StatsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 hover:border-slate-700/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            </p>
            {trend && <p className="text-xs text-emerald-400">{trend}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
