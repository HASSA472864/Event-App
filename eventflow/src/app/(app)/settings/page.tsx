"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [email] = useState(session?.user?.email || "")

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          Profile Information
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-white font-medium">{session?.user?.name || "User"}</p>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-slate-800/30 border-slate-700/30 text-slate-500 mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        <Separator className="my-6 bg-slate-800" />

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-emerald-400 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </motion.div>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-violet-400" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { label: "Email notifications for new registrations", defaultOn: true },
            { label: "Email notifications for event reminders", defaultOn: true },
            { label: "Push notifications for check-ins", defaultOn: false },
            { label: "Weekly analytics digest", defaultOn: true },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{pref.label}</span>
              <button
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  pref.defaultOn ? "bg-violet-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    pref.defaultOn ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-slate-400 mb-4">
          Permanently delete your account and all associated data
        </p>
        <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          Delete Account
        </Button>
      </motion.div>
    </div>
  )
}
