"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface TicketTier {
  id: string
  name: string
  price: number
  quantity: number | null
  description: string
  isFree: boolean
}

export interface WizardFormData {
  // Step 1: Basics
  title: string
  categoryId: string

  // Step 2: Details
  description: string
  coverImage: string

  // Step 3: Date & Time
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
  timezone: string
  isVirtual: boolean
  location: string
  meetingUrl: string

  // Step 4: Tickets
  tickets: TicketTier[]

  // Step 5: Settings
  capacity: number | null
  isRecurring: boolean
  recurringRule: string
  status: "DRAFT" | "PUBLISHED"
}

export interface StepValidation {
  isValid: boolean
  errors: Record<string, string>
}

interface WizardContextType {
  currentStep: number
  totalSteps: number
  formData: WizardFormData
  stepValidation: StepValidation
  setCurrentStep: (step: number) => void
  updateFormData: (data: Partial<WizardFormData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  validateStep: (step: number) => StepValidation
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  completedSteps: Set<number>
  markStepCompleted: (step: number) => void
}

const defaultFormData: WizardFormData = {
  title: "",
  categoryId: "",
  description: "",
  coverImage: "",
  startDate: null,
  endDate: null,
  startTime: "09:00",
  endTime: "17:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isVirtual: false,
  location: "",
  meetingUrl: "",
  tickets: [
    {
      id: crypto.randomUUID(),
      name: "General Admission",
      price: 0,
      quantity: null,
      description: "",
      isFree: true,
    },
  ],
  capacity: null,
  isRecurring: false,
  recurringRule: "",
  status: "DRAFT",
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData)
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isValid: true,
    errors: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const totalSteps = 6

  const updateFormData = useCallback((data: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }, [])

  const validateStep = useCallback(
    (step: number): StepValidation => {
      const errors: Record<string, string> = {}

      switch (step) {
        case 1:
          if (!formData.title || formData.title.trim().length < 3) {
            errors.title = "Title must be at least 3 characters"
          }
          break
        case 2:
          if (!formData.description || formData.description.trim().length < 10) {
            errors.description = "Description must be at least 10 characters"
          }
          break
        case 3:
          if (!formData.startDate) {
            errors.startDate = "Start date is required"
          }
          if (!formData.endDate) {
            errors.endDate = "End date is required"
          }
          if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate)
            const end = new Date(formData.endDate)
            const [sh, sm] = formData.startTime.split(":").map(Number)
            const [eh, em] = formData.endTime.split(":").map(Number)
            start.setHours(sh, sm)
            end.setHours(eh, em)
            if (end <= start) {
              errors.endDate = "End date/time must be after start date/time"
            }
          }
          if (!formData.isVirtual && !formData.location.trim()) {
            errors.location = "Location is required for in-person events"
          }
          if (formData.isVirtual && !formData.meetingUrl.trim()) {
            errors.meetingUrl = "Meeting URL is required for virtual events"
          }
          break
        case 4:
          if (formData.tickets.length === 0) {
            errors.tickets = "At least one ticket tier is required"
          }
          formData.tickets.forEach((ticket, index) => {
            if (!ticket.name.trim()) {
              errors[`ticket_${index}_name`] = `Ticket ${index + 1} name is required`
            }
            if (!ticket.isFree && ticket.price <= 0) {
              errors[`ticket_${index}_price`] = `Ticket ${index + 1} needs a price greater than 0`
            }
          })
          break
        case 5:
          // Settings are all optional
          if (formData.isRecurring && !formData.recurringRule) {
            errors.recurringRule = "Please select a recurring schedule"
          }
          break
        case 6:
          // Review step — no extra validation
          break
      }

      const validation = { isValid: Object.keys(errors).length === 0, errors }
      setStepValidation(validation)
      return validation
    },
    [formData]
  )

  const nextStep = useCallback(() => {
    const validation = validateStep(currentStep)
    if (validation.isValid) {
      markStepCompleted(currentStep)
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }, [currentStep, totalSteps, validateStep, markStepCompleted])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback(
    (step: number) => {
      if (step < currentStep || completedSteps.has(step - 1) || step === 1) {
        setCurrentStep(step)
      }
    },
    [currentStep, completedSteps]
  )

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        totalSteps,
        formData,
        stepValidation,
        setCurrentStep,
        updateFormData,
        nextStep,
        prevStep,
        goToStep,
        validateStep,
        isSubmitting,
        setIsSubmitting,
        completedSteps,
        markStepCompleted,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return context
}
