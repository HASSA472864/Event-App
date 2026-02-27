"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  BarChart3,
  QrCode,
  CreditCard,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Smart Event Builder",
    description: "6-step wizard with rich text editing, image uploads, and multi-tier ticketing",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description: "Stripe-powered checkout for paid events with automatic confirmation",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: QrCode,
    title: "QR Check-in",
    description: "Scan attendee QR codes for instant check-in at your venue",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Real-time registration trends, revenue tracking, and conversion insights",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "Full attendee panel with search, filters, CSV export, and status control",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated reminders for organizers and attendees at every stage",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
]

const stats = [
  { value: "10K+", label: "Events Created" },
  { value: "500K+", label: "Attendees Managed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EventFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300">The modern event platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Create unforgettable
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                events effortlessly
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              From intimate meetups to large conferences — build, manage, and grow your events
              with powerful tools for ticketing, check-in, analytics, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white h-14 px-8 text-lg">
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:text-white h-14 px-8 text-lg">
                  See Features
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to run events
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete toolkit for event organizers — from creation to post-event analytics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing-like Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why EventFlow?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security with Stripe payments and encrypted data" },
              { icon: Globe, title: "Works Everywhere", desc: "Responsive design that looks great on desktop, tablet, and mobile" },
              { icon: Zap, title: "Lightning Fast", desc: "Built on Next.js with optimized performance and instant page loads" },
              { icon: CheckCircle2, title: "Free to Start", desc: "Create unlimited free events. Only pay platform fees on paid tickets" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl"
              >
                <div className="p-2 bg-violet-500/10 rounded-lg flex-shrink-0">
                  <item.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to create your next event?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of organizers who trust EventFlow for their events
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white h-14 px-10 text-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-400">EventFlow</span>
          </div>
          <p className="text-sm text-slate-500">
            Built with Next.js, Prisma, and Stripe
          </p>
        </div>
      </footer>
    </div>
  )
}
