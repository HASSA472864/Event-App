"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
  UserCheck,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

type CheckinResult = {
  type: "success" | "error" | "warning"
  message: string
  attendee?: {
    name: string | null
    email: string
    ticket?: string
    checkedInAt?: string
  }
}

export default function CheckinPage() {
  const params = useParams()
  const eventId = params.id as string
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [checkinCount, setCheckinCount] = useState(0)
  const [recentCheckins, setRecentCheckins] = useState<
    { name: string; time: string }[]
  >([])

  const processCheckin = useCallback(async (qrCode: string) => {
    if (loading) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: "success",
          message: data.message,
          attendee: {
            name: data.registration.user.name,
            email: data.registration.user.email,
            ticket: data.registration.ticket?.name,
          },
        })
        setCheckinCount((c) => c + 1)
        setRecentCheckins((prev) => [
          {
            name: data.registration.user.name || data.registration.user.email,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 9),
        ])
      } else if (res.status === 409) {
        setResult({
          type: "warning",
          message: "Already checked in",
          attendee: {
            name: data.registration?.user?.name,
            email: data.registration?.user?.email,
            checkedInAt: data.checkedInAt,
          },
        })
      } else {
        setResult({
          type: "error",
          message: data.error || "Check-in failed",
        })
      }
    } catch {
      setResult({ type: "error", message: "Connection error" })
    } finally {
      setLoading(false)
    }
  }, [eventId, loading])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
    } catch {
      setResult({ type: "error", message: "Camera access denied. Use manual entry." })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      processCheckin(manualCode.trim())
      setManualCode("")
    }
  }

  const resultIcon = {
    success: <CheckCircle2 className="w-16 h-16 text-emerald-400" />,
    error: <XCircle className="w-16 h-16 text-red-400" />,
    warning: <AlertTriangle className="w-16 h-16 text-amber-400" />,
  }

  const resultBg = {
    success: "bg-emerald-500/10 border-emerald-500/30",
    error: "bg-red-500/10 border-red-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}/manage`}>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <QrCode className="w-6 h-6 text-violet-400" />
              QR Check-in
            </h1>
            <p className="text-slate-400 text-sm">Scan attendee QR codes to check them in</p>
          </div>
        </div>
        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-lg px-4 py-1">
          <UserCheck className="w-4 h-4 mr-1" />
          {checkinCount}
        </Badge>
      </div>

      {/* Camera Scanner */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-violet-400/50 rounded-2xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-400 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-400 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-400 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-400 rounded-br-2xl" />
                </div>
                <motion.div
                  animate={{ y: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="absolute w-56 h-0.5 bg-violet-400/80 shadow-lg shadow-violet-400/50"
                />
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Camera scanner ready</p>
              <p className="text-xs text-slate-500">
                Note: For QR scanning, use your phone&apos;s native camera app to scan the QR code,
                then paste the code below. Browser-based QR scanning requires additional libraries.
              </p>
            </div>
          )}
        </div>
        <div className="p-4 flex justify-center">
          <Button
            onClick={cameraActive ? stopCamera : startCamera}
            variant={cameraActive ? "destructive" : "default"}
            className={!cameraActive ? "bg-violet-600 hover:bg-violet-700" : ""}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Manual Check-in
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            placeholder="Enter QR code or attendee email..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="bg-slate-800/50 border-slate-700/50 text-white"
          />
          <Button type="submit" disabled={loading || !manualCode.trim()} className="bg-violet-600 hover:bg-violet-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check In"}
          </Button>
        </form>
      </div>

      {/* Result Display */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.message}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`border rounded-xl p-6 text-center ${resultBg[result.type]}`}
          >
            <div className="flex justify-center mb-3">
              {resultIcon[result.type]}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{result.message}</h3>
            {result.attendee && (
              <div className="mt-3 space-y-1">
                {result.attendee.name && (
                  <p className="text-slate-300">{result.attendee.name}</p>
                )}
                <p className="text-sm text-slate-400">{result.attendee.email}</p>
                {result.attendee.ticket && (
                  <Badge variant="outline" className="border-slate-700 text-slate-300 mt-2">
                    {result.attendee.ticket}
                  </Badge>
                )}
                {result.attendee.checkedInAt && (
                  <p className="text-xs text-slate-500 mt-2">
                    Originally checked in at {new Date(result.attendee.checkedInAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Check-ins */}
      {recentCheckins.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Check-ins</h3>
          <div className="space-y-2">
            {recentCheckins.map((checkin, i) => (
              <motion.div
                key={`${checkin.name}-${checkin.time}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white text-sm">{checkin.name}</span>
                </div>
                <span className="text-xs text-slate-500">{checkin.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
