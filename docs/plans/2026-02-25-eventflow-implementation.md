# EventFlow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build EventFlow — a full-stack advanced event organizer with auth, ticketing, QR check-in, analytics, calendar, and real-time features.

**Architecture:** Next.js 14 App Router with Prisma ORM + PostgreSQL. Auth via NextAuth.js. Payments via Stripe. All UI built with TailwindCSS + shadcn/ui + Framer Motion. Real-time check-in via Server-Sent Events.

**Tech Stack:** Next.js 14, Prisma, PostgreSQL (Neon), NextAuth.js, Stripe, Resend, Cloudinary, TipTap, Recharts, qrcode.react, html5-qrcode, Framer Motion, shadcn/ui, TailwindCSS

---

## Phase 1: Project Scaffolding

### Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`

**Step 1: Scaffold project**
```bash
npx create-next-app@latest eventflow \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd eventflow
```

**Step 2: Install all dependencies**
```bash
npm install \
  @prisma/client prisma \
  next-auth @auth/prisma-adapter \
  @stripe/stripe-js stripe \
  resend \
  cloudinary next-cloudinary \
  @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link \
  recharts \
  qrcode.react html5-qrcode \
  framer-motion \
  react-big-calendar date-fns \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs \
  @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-avatar \
  lucide-react \
  clsx tailwind-merge \
  react-hook-form @hookform/resolvers zod \
  bcryptjs \
  uuid \
  rrule \
  react-qr-reader \
  next-themes
npm install -D @types/bcryptjs @types/uuid @types/react-big-calendar
```

**Step 3: Install shadcn/ui**
```bash
npx shadcn-ui@latest init
# Choose: Default style, Slate base color, CSS variables: yes
npx shadcn-ui@latest add button card input label badge avatar
npx shadcn-ui@latest add dialog dropdown-menu tabs select toast
npx shadcn-ui@latest add sheet skeleton separator progress
npx shadcn-ui@latest add calendar popover command
```

**Step 4: Commit**
```bash
git add -A
git commit -m "chore: scaffold Next.js 14 project with all dependencies"
```

---

### Task 2: Environment & Configuration

**Files:**
- Create: `.env.local`, `.env.example`, `src/lib/env.ts`

**Step 1: Create `.env.example`**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/eventflow"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Resend
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@eventflow.app"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Step 2: Create `src/lib/env.ts`**
```typescript
// Type-safe environment variable access
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
} as const
```

**Step 3: Create `.env.local` from `.env.example` and fill in real values**

**Step 4: Commit**
```bash
git add .env.example src/lib/env.ts
git commit -m "chore: add environment configuration"
```

---

## Phase 2: Database

### Task 3: Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`

**Step 1: Initialize Prisma**
```bash
npx prisma init
```

**Step 2: Replace `prisma/schema.prisma` with full schema**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

enum RegistrationStatus {
  PENDING
  CONFIRMED
  WAITLISTED
  CANCELLED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
}

// Required by NextAuth PrismaAdapter
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  avatar        String?
  role          Role      @default(USER)
  onboarded     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  events        Event[]
  registrations Registration[]
  coOrganizing  CoOrganizer[]
  notifications Notification[]
}

model Category {
  id     String  @id @default(cuid())
  name   String
  color  String
  icon   String
  events Event[]
}

model Event {
  id            String      @id @default(cuid())
  title         String
  slug          String      @unique
  description   String      @db.Text
  coverImage    String?
  startDate     DateTime
  endDate       DateTime
  timezone      String      @default("UTC")
  location      String?
  latitude      Float?
  longitude     Float?
  isVirtual     Boolean     @default(false)
  meetingUrl    String?
  status        EventStatus @default(DRAFT)
  capacity      Int?
  isRecurring   Boolean     @default(false)
  recurringRule String?
  categoryId    String?
  organizerId   String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  organizer     User          @relation(fields: [organizerId], references: [id])
  category      Category?     @relation(fields: [categoryId], references: [id])
  tickets       Ticket[]
  registrations Registration[]
  coOrganizers  CoOrganizer[]
  invitations   Invitation[]
  reminders     Reminder[]
  analytics     EventAnalytics?
  discountCodes DiscountCode[]
}

model Ticket {
  id            String   @id @default(cuid())
  eventId       String
  name          String
  description   String?
  price         Float    @default(0)
  quantity      Int?
  sold          Int      @default(0)
  salesStart    DateTime?
  salesEnd      DateTime?
  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations Registration[]
}

model Registration {
  id              String             @id @default(cuid())
  eventId         String
  userId          String
  ticketId        String?
  status          RegistrationStatus @default(PENDING)
  qrCode          String             @unique @default(uuid())
  checkedIn       Boolean            @default(false)
  checkedInAt     DateTime?
  stripePaymentId String?
  createdAt       DateTime           @default(now())
  event           Event              @relation(fields: [eventId], references: [id])
  user            User               @relation(fields: [userId], references: [id])
  ticket          Ticket?            @relation(fields: [ticketId], references: [id])
}

model Invitation {
  id        String           @id @default(cuid())
  eventId   String
  email     String
  status    InvitationStatus @default(PENDING)
  token     String           @unique @default(uuid())
  sentAt    DateTime         @default(now())
  event     Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model CoOrganizer {
  id      String @id @default(cuid())
  eventId String
  userId  String
  role    String @default("viewer")
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user    User   @relation(fields: [userId], references: [id])
  @@unique([eventId, userId])
}

model Reminder {
  id          String   @id @default(cuid())
  eventId     String
  type        String
  scheduledAt DateTime
  sent        Boolean  @default(false)
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model EventAnalytics {
  id             String  @id @default(cuid())
  eventId        String  @unique
  pageViews      Int     @default(0)
  totalRevenue   Float   @default(0)
  conversionRate Float   @default(0)
  event          Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model DiscountCode {
  id         String    @id @default(cuid())
  eventId    String
  code       String    @unique
  discount   Float
  isPercent  Boolean   @default(true)
  usageLimit Int?
  usedCount  Int       @default(0)
  expiresAt  DateTime?
  event      Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Step 3: Push schema to database**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Step 4: Create `src/lib/prisma.ts`**
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] })

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma
```

**Step 5: Seed categories**
Create `prisma/seed.ts`:
```typescript
import { prisma } from "../src/lib/prisma"

async function main() {
  const categories = [
    { name: "Conference", color: "#7C3AED", icon: "presentation" },
    { name: "Party", color: "#EC4899", icon: "party-popper" },
    { name: "Wedding", color: "#F59E0B", icon: "heart" },
    { name: "Concert", color: "#10B981", icon: "music" },
    { name: "Sports", color: "#3B82F6", icon: "trophy" },
    { name: "Workshop", color: "#F97316", icon: "hammer" },
    { name: "Networking", color: "#6366F1", icon: "users" },
    { name: "Other", color: "#6B7280", icon: "calendar" },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.name },
      update: {},
      create: cat,
    })
  }
  console.log("Seeded categories")
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

Run: `npx prisma db seed`

**Step 6: Commit**
```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema and database setup"
```

---

## Phase 3: Authentication

### Task 4: NextAuth Configuration

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

**Step 1: Create `src/lib/auth.ts`**
```typescript
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { env } from "./env"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/onboarding",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.onboarded = (user as any).onboarded
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.onboarded = token.onboarded as boolean
      }
      return session
    },
  },
}
```

**Step 2: Create route handler**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Extend NextAuth types**
Create `src/types/next-auth.d.ts`:
```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      onboarded: boolean
    } & DefaultSession["user"]
  }
}
```

**Step 4: Create Register API**
```typescript
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { name, email, password } = parsed.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })
  return NextResponse.json({ id: user.id }, { status: 201 })
}
```

**Step 5: Commit**
```bash
git add src/lib/auth.ts src/app/api/auth/ src/types/
git commit -m "feat: add NextAuth with email/password + Google + GitHub"
```

---

### Task 5: Auth Pages (Login, Register, Onboarding)

**Files:**
- Create: `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`, `src/app/auth/onboarding/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`

**Step 1: Create shared auth layout**
```typescript
// src/app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Build `LoginForm.tsx`** — email/password form + Google/GitHub OAuth buttons, uses `signIn` from next-auth/react, validates with zod + react-hook-form, shows error states, redirects to `/dashboard` on success

**Step 3: Build `RegisterForm.tsx`** — name/email/password fields, calls `POST /api/auth/register` then `signIn`, validates password strength

**Step 4: Build onboarding page** — avatar upload (Cloudinary widget), display name, then `PATCH /api/user/onboard` to set `onboarded: true`, redirect to `/dashboard`

**Step 5: Add middleware to protect routes**
```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/auth/login" },
})

export const config = {
  matcher: ["/dashboard/:path*", "/events/create", "/events/:id/manage/:path*"],
}
```

**Step 6: Commit**
```bash
git add src/app/auth/ src/components/auth/ src/middleware.ts
git commit -m "feat: add auth pages and route protection"
```

---

## Phase 4: Core Layout & Navigation

### Task 6: App Shell (Sidebar + Header)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/app/(app)/layout.tsx`

**Step 1: Create app layout wrapper**
```typescript
// src/app/(app)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

**Step 2: Build `Sidebar.tsx`**
- Dark glassmorphism panel (`bg-slate-900/50 backdrop-blur`)
- Logo + app name at top
- Nav links: Dashboard, Events, Calendar, Analytics
- User avatar + name at bottom with dropdown (profile, settings, sign out)
- Active link highlighted with violet accent
- Collapsible on mobile

**Step 3: Build `Header.tsx`**
- Page title (dynamic via `usePathname`)
- Search bar (global event search)
- Notification bell with unread count badge
- Quick "Create Event" button

**Step 4: Commit**
```bash
git add src/components/layout/ src/app/\(app\)/
git commit -m "feat: add app shell with sidebar and header"
```

---

## Phase 5: Dashboard

### Task 7: Dashboard Page

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/components/dashboard/StatsCard.tsx`, `src/components/dashboard/UpcomingEvents.tsx`, `src/components/dashboard/ActivityFeed.tsx`
- Create: `src/app/api/dashboard/route.ts`

**Step 1: Create dashboard API**
```typescript
// src/app/api/dashboard/route.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const [totalEvents, upcomingEvents, totalRegistrations, totalRevenue] =
    await Promise.all([
      prisma.event.count({ where: { organizerId: userId } }),
      prisma.event.findMany({
        where: { organizerId: userId, startDate: { gte: new Date() }, status: "PUBLISHED" },
        orderBy: { startDate: "asc" },
        take: 5,
        include: { category: true, _count: { select: { registrations: true } } },
      }),
      prisma.registration.count({
        where: { event: { organizerId: userId }, status: "CONFIRMED" },
      }),
      prisma.eventAnalytics.aggregate({
        where: { event: { organizerId: userId } },
        _sum: { totalRevenue: true },
      }),
    ])

  return NextResponse.json({
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    totalRevenue: totalRevenue._sum.totalRevenue ?? 0,
  })
}
```

**Step 2: Build `StatsCard.tsx`** — animated counter (framer-motion), icon, label, value, trend indicator (+12% this month)

**Step 3: Build dashboard page** — 4 stat cards grid, upcoming events list, activity feed, quick-create button

**Step 4: Commit**
```bash
git add src/app/\(app\)/dashboard/ src/components/dashboard/ src/app/api/dashboard/
git commit -m "feat: add dashboard with stats and upcoming events"
```

---

## Phase 6: Event Creation

### Task 8: Multi-Step Event Creation Wizard

**Files:**
- Create: `src/app/(app)/events/create/page.tsx`
- Create: `src/components/events/wizard/` (6 step components)
- Create: `src/app/api/events/route.ts`
- Create: `src/lib/slugify.ts`

**Step 1: Create `src/lib/slugify.ts`**
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    + "-" + Date.now().toString(36)
}
```

**Step 2: Create `POST /api/events`**
```typescript
// src/app/api/events/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { z } from "zod"

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string(),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingUrl: z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
  isRecurring: z.boolean().default(false),
  recurringRule: z.string().optional(),
  tickets: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().int().positive().optional(),
    description: z.string().optional(),
  })),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { tickets, ...eventData } = parsed.data
  const event = await prisma.event.create({
    data: {
      ...eventData,
      slug: slugify(eventData.title),
      organizerId: session.user.id,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      tickets: { create: tickets },
      analytics: { create: {} },
    },
    include: { tickets: true },
  })

  return NextResponse.json(event, { status: 201 })
}
```

**Step 3: Build wizard state with React context**
```typescript
// src/components/events/wizard/WizardContext.tsx
// Holds all form state across steps
// Steps: basics → details → datetime → tickets → settings → review
```

**Step 4: Build each wizard step component**
- `Step1Basics.tsx` — title, category picker
- `Step2Details.tsx` — TipTap rich text editor, Cloudinary image upload
- `Step3DateTime.tsx` — date/time pickers, timezone selector, virtual toggle
- `Step4Tickets.tsx` — add/remove ticket tiers, free vs paid toggle
- `Step5Settings.tsx` — recurring rule builder, capacity, status
- `Step6Review.tsx` — full preview, publish button

**Step 5: Wire wizard with progress bar and step navigation**

**Step 6: Commit**
```bash
git add src/app/\(app\)/events/create/ src/components/events/ src/app/api/events/
git commit -m "feat: add 6-step event creation wizard"
```

---

### Task 9: Event Listing & Public Event Page

**Files:**
- Create: `src/app/(app)/events/page.tsx`
- Create: `src/app/events/[id]/page.tsx`
- Create: `src/components/events/EventCard.tsx`
- Create: `src/app/api/events/[id]/route.ts`

**Step 1: Create `GET /api/events`** — list with filters (status, category, upcoming/past, search query, pagination)

**Step 2: Create `GET /api/events/[id]`** — full event with tickets, organizer, category, registration count

**Step 3: Build `EventCard.tsx`** — cover image, title, date, location, category badge, attendee count, price range

**Step 4: Build events listing page** — search bar, category filter pills, grid/list view toggle, pagination

**Step 5: Build public event page** — hero cover image, event details, ticket selection panel, RSVP/Buy button, organizer info, share buttons, map embed for physical events

**Step 6: Commit**
```bash
git add src/app/\(app\)/events/page.tsx src/app/events/ src/components/events/
git commit -m "feat: add event listing and public event pages"
```

---

## Phase 7: Registration & Ticketing

### Task 10: Free RSVP & Paid Stripe Checkout

**Files:**
- Create: `src/app/api/events/[id]/register/route.ts`
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `src/lib/stripe.ts`
- Create: `src/lib/qr.ts`

**Step 1: Create `src/lib/stripe.ts`**
```typescript
import Stripe from "stripe"
import { env } from "./env"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})
```

**Step 2: Create `src/lib/qr.ts`** — generates UUID for QR code
```typescript
import { v4 as uuidv4 } from "uuid"
export function generateQRCode(): string {
  return uuidv4()
}
```

**Step 3: Create free RSVP registration endpoint**
```typescript
// src/app/api/events/[id]/register/route.ts
// POST: check capacity, create Registration with status CONFIRMED,
// generate QR code, send confirmation email via Resend
// Handle waitlist if at capacity
```

**Step 4: Create Stripe Checkout session endpoint**
```typescript
// src/app/api/stripe/checkout/route.ts
// POST: create Stripe Checkout session with line_items per ticket
// metadata: { eventId, userId, ticketId }
// success_url and cancel_url
```

**Step 5: Create Stripe webhook handler**
```typescript
// src/app/api/stripe/webhook/route.ts
// Handle checkout.session.completed:
//   - Create Registration with CONFIRMED status
//   - Store stripePaymentId
//   - Send confirmation email
//   - Update EventAnalytics.totalRevenue
```

**Step 6: Commit**
```bash
git add src/app/api/events/\[id\]/register/ src/app/api/stripe/ src/lib/stripe.ts src/lib/qr.ts
git commit -m "feat: add RSVP registration and Stripe payment flow"
```

---

## Phase 8: Attendee Management

### Task 11: Organizer Attendee Panel

**Files:**
- Create: `src/app/(app)/events/[id]/attendees/page.tsx`
- Create: `src/app/api/events/[id]/attendees/route.ts`
- Create: `src/app/api/events/[id]/invite/route.ts`
- Create: `src/lib/email.ts`

**Step 1: Create `src/lib/email.ts`** — Resend wrapper for sending invitation, confirmation, and reminder emails

**Step 2: Create attendees API** — GET with search/filter/pagination, supports CSV export via `?format=csv`

**Step 3: Create invite API** — accepts array of emails, creates Invitation records, sends invite emails with unique token link

**Step 4: Build attendees page** — searchable table (name, email, ticket, status, check-in status), bulk actions (resend confirmation, cancel), invite modal, export CSV button

**Step 5: Add co-organizer management** — add by email, assign role (editor/check-in-staff/viewer)

**Step 6: Commit**
```bash
git add src/app/\(app\)/events/\[id\]/attendees/ src/app/api/events/\[id\]/
git commit -m "feat: add attendee management and email invitations"
```

---

## Phase 9: Check-in System

### Task 12: QR Check-in Scanner

**Files:**
- Create: `src/app/(app)/events/[id]/checkin/page.tsx`
- Create: `src/app/api/events/[id]/checkin/route.ts`
- Create: `src/app/api/events/[id]/sse/route.ts`
- Create: `src/components/checkin/QRScanner.tsx`
- Create: `src/components/checkin/CheckinStats.tsx`

**Step 1: Create check-in API**
```typescript
// src/app/api/events/[id]/checkin/route.ts
// POST { qrCode: string }:
//   - Find registration by qrCode
//   - Verify belongs to this event
//   - If already checked in → return error
//   - Set checkedIn: true, checkedInAt: now()
//   - Return attendee name and ticket type
```

**Step 2: Create SSE endpoint for real-time updates**
```typescript
// src/app/api/events/[id]/sse/route.ts
// GET: returns ReadableStream that pushes check-in counts every 2s
// Uses Prisma to query current checked-in count
```

**Step 3: Build `QRScanner.tsx`**
```typescript
// Uses html5-qrcode to access camera
// On successful scan: POST to check-in API
// Show success (name, green flash) or error (already checked in, red flash)
// Manual search input fallback
```

**Step 4: Build check-in page** — scanner on left, real-time stats on right (total registered, checked in, check-in rate progress bar), recent check-ins feed

**Step 5: Commit**
```bash
git add src/app/\(app\)/events/\[id\]/checkin/ src/app/api/events/\[id\]/checkin/ src/app/api/events/\[id\]/sse/ src/components/checkin/
git commit -m "feat: add QR check-in scanner with real-time SSE updates"
```

---

## Phase 10: Analytics

### Task 13: Event Analytics Dashboard

**Files:**
- Create: `src/app/(app)/events/[id]/analytics/page.tsx`
- Create: `src/app/api/events/[id]/analytics/route.ts`
- Create: `src/components/analytics/AttendanceChart.tsx`
- Create: `src/components/analytics/RevenueChart.tsx`
- Create: `src/components/analytics/FunnelChart.tsx`

**Step 1: Create analytics API**
```typescript
// GET /api/events/[id]/analytics
// Returns:
//   - registrationsOverTime: [{ date, count }] grouped by day
//   - revenueByTicket: [{ ticketName, revenue, count }]
//   - funnel: { pageViews, registered, checkedIn }
//   - summary: { totalRevenue, conversionRate, checkedInRate }
```

**Step 2: Build `AttendanceChart.tsx`** — Recharts LineChart showing registrations over time, date range selector

**Step 3: Build `RevenueChart.tsx`** — BarChart by ticket type + PieChart breakdown

**Step 4: Build `FunnelChart.tsx`** — custom funnel visualization (page views → registered → checked in)

**Step 5: Build analytics page** — summary stat cards at top, three charts below, export PDF/CSV button

**Step 6: Commit**
```bash
git add src/app/\(app\)/events/\[id\]/analytics/ src/app/api/events/\[id\]/analytics/ src/components/analytics/
git commit -m "feat: add event analytics dashboard with Recharts"
```

---

## Phase 11: Calendar

### Task 14: Calendar View

**Files:**
- Create: `src/app/(app)/calendar/page.tsx`
- Create: `src/components/calendar/EventCalendar.tsx`
- Create: `src/app/api/calendar/route.ts`

**Step 1: Create calendar API** — GET events for a date range, returns events formatted for react-big-calendar

**Step 2: Build `EventCalendar.tsx`**
```typescript
// Uses react-big-calendar with date-fns localizer
// Month/Week/Day toolbar
// Color-code events by category
// Click event → navigate to event page
// Drag to reschedule (organizer only) → PATCH /api/events/[id]
```

**Step 3: Add iCal export**
```typescript
// GET /api/calendar/export?userId=...
// Returns .ics file with all user events
// Uses rrule for recurring events
```

**Step 4: Commit**
```bash
git add src/app/\(app\)/calendar/ src/components/calendar/ src/app/api/calendar/
git commit -m "feat: add calendar view with month/week/day and iCal export"
```

---

## Phase 12: Notifications & Reminders

### Task 15: Notification System

**Files:**
- Create: `src/app/api/notifications/route.ts`
- Create: `src/components/layout/NotificationBell.tsx`
- Create: `src/lib/scheduler.ts`

**Step 1: Create notifications API** — GET unread notifications, PATCH to mark as read

**Step 2: Build `NotificationBell.tsx`** — bell icon with unread badge, dropdown showing last 10 notifications, mark all read

**Step 3: Create `src/lib/scheduler.ts`** — function to check and send due reminders (called from a cron job or API route `/api/cron/reminders`)

**Step 4: Create cron endpoint**
```typescript
// src/app/api/cron/reminders/route.ts
// GET (protected by CRON_SECRET header)
// Find all unsent Reminders where scheduledAt <= now()
// Send email via Resend
// Mark as sent
```

**Step 5: Commit**
```bash
git add src/components/layout/NotificationBell.tsx src/app/api/notifications/ src/app/api/cron/ src/lib/scheduler.ts
git commit -m "feat: add in-app notifications and email reminder system"
```

---

## Phase 13: Landing Page & Polish

### Task 16: Landing Page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/landing/Hero.tsx`, `src/components/landing/Features.tsx`, `src/components/landing/CTA.tsx`

**Step 1: Build hero section** — animated gradient background, headline, subheadline, "Get Started" + "See Demo" CTAs, animated mockup screenshot

**Step 2: Build features grid** — 6 feature cards with icons (Create Events, Sell Tickets, QR Check-in, Analytics, Calendar, Team Collaboration)

**Step 3: Build CTA section** — "Start organizing today" with email capture

**Step 4: Add dark/light mode toggle**
```typescript
// Uses next-themes ThemeProvider
// Toggle button in header
```

**Step 5: Commit**
```bash
git add src/app/page.tsx src/components/landing/
git commit -m "feat: add landing page with hero and features"
```

---

### Task 17: Final Polish & Error Handling

**Files:**
- Create: `src/app/error.tsx`, `src/app/not-found.tsx`
- Create: `src/components/ui/LoadingSkeleton.tsx`

**Step 1: Add loading skeletons** — skeleton variants for EventCard, StatsCard, table rows

**Step 2: Add error boundaries** — `error.tsx` pages at app and route segment levels

**Step 3: Add not-found page** — 404 with "Go Home" button

**Step 4: Add toast notifications** — use shadcn toast for all success/error feedback

**Step 5: Final responsive audit** — test all pages at 375px (mobile), 768px (tablet), 1280px (desktop)

**Step 6: Final commit**
```bash
git add -A
git commit -m "feat: add error handling, loading states, and responsive polish"
```

---

## Running the App

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000

# View database
npx prisma studio
```

---

## Environment Checklist Before First Run

- [ ] `DATABASE_URL` — PostgreSQL connection string (Neon or Supabase)
- [ ] `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Google Cloud Console
- [ ] `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` — GitHub OAuth App
- [ ] `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` — `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] `RESEND_API_KEY` — Resend Dashboard
- [ ] `CLOUDINARY_*` — Cloudinary Dashboard
