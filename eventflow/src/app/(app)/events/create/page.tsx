"use client"

import { WizardProvider, useWizard } from "@/components/events/wizard/WizardContext"
import { Step1Basics } from "@/components/events/wizard/Step1Basics"
import { Step2Details } from "@/components/events/wizard/Step2Details"
import { Step3DateTime } from "@/components/events/wizard/Step3DateTime"
import { Step4Tickets } from "@/components/events/wizard/Step4Tickets"
import { Step5Settings } from "@/components/events/wizard/Step5Settings"
import { Step6Review } from "@/components/events/wizard/Step6Review"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Type,
  FileText,
  CalendarDays,
  Ticket,
  Settings,
  Eye,
  Check,
} from "lucide-react"

const steps = [
  { number: 1, title: "Basics", icon: Type },
  { number: 2, title: "Details", icon: FileText },
  { number: 3, title: "Date & Time", icon: CalendarDays },
  { number: 4, title: "Tickets", icon: Ticket },
  { number: 5, title: "Settings", icon: Settings },
  { number: 6, title: "Review", icon: Eye },
]

function StepIndicator() {
  const { currentStep, completedSteps, goToStep } = useWizard()

  return (
    <div className="hidden lg:flex items-center gap-1 w-full">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number
        const isCompleted = completedSteps.has(step.number)
        const Icon = step.icon

        return (
          <div key={step.number} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => goToStep(step.number)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap",
                isActive
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : isCompleted
                  ? "text-emerald-400 hover:bg-slate-800/50 cursor-pointer"
                  : "text-slate-500 cursor-default"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                  isActive
                    ? "bg-violet-500 text-white"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </div>
              <span className="hidden xl:inline">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-1",
                  isCompleted ? "bg-emerald-500/30" : "bg-slate-800"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MobileStepIndicator() {
  const { currentStep, totalSteps } = useWizard()
  const step = steps.find((s) => s.number === currentStep)!
  const Icon = step.icon

  return (
    <div className="lg:hidden space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Icon className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{step.title}</p>
            <p className="text-xs text-slate-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
      </div>
      <Progress
        value={(currentStep / totalSteps) * 100}
        className="h-1.5 bg-slate-800"
      />
    </div>
  )
}

function WizardContent() {
  const { currentStep, nextStep, prevStep, totalSteps } = useWizard()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Basics />
      case 2:
        return <Step2Details />
      case 3:
        return <Step3DateTime />
      case 4:
        return <Step4Tickets />
      case 5:
        return <Step5Settings />
      case 6:
        return <Step6Review />
      default:
        return <Step1Basics />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Create Event
            </h1>
            <p className="text-slate-500 mt-1">
              Fill out the steps below to create your event.
            </p>
          </div>
        </div>

        {/* Desktop Progress */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4">
          <StepIndicator />
          <MobileStepIndicator />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl p-6 md:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {currentStep < totalSteps && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "h-11 px-6 border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white",
              currentStep === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {steps.map((step) => (
              <div
                key={step.number}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  step.number === currentStep
                    ? "w-6 bg-violet-500"
                    : step.number < currentStep
                    ? "w-1.5 bg-violet-500/40"
                    : "w-1.5 bg-slate-700"
                )}
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={nextStep}
            className="h-11 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Back button on review step */}
      {currentStep === totalSteps && (
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="h-11 px-6 border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </div>
      )}
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
