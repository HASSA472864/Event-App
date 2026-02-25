# EventFlow — Advanced Event Organizer App
**Date:** 2026-02-25
**Stack:** Next.js 14 · Prisma · PostgreSQL · TailwindCSS · shadcn/ui

---

## Overview

EventFlow is a full-stack, full-spectrum event organizer application supporting both personal/social and professional/corporate events. It covers the complete event lifecycle: creation, promotion, ticketing, attendee management, check-in, and post-event analytics.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS + shadcn/ui + Framer Motion |
| Database ORM | Prisma |
| Database | PostgreSQL (Neon or Supabase) |
| Auth | NextAuth.js (email/password + Google + GitHub OAuth) |
| Email | Resend |
| Payments | Stripe (Checkout + Refunds) |
| File Storage | Cloudinary |
| Charts | Recharts |
| Rich Text Editor | TipTap |
| QR Codes | qrcode.react (generation) + html5-qrcode (scanning) |
| Real-time | Server-Sent Events (SSE) |

### Design Language
- **Theme:** Dark-first with glassmorphism cards and subtle gradients
- **Accent Color:** Violet/Purple (`#7C3AED`) with indigo accents
- **Typography:** Geist Sans (headings) + Inter (body)
- **Animations:** Framer Motion — page transitions, card reveals, counter animations

---

## Page Routes

```
/                          Landing page (hero, features, CTA)
/auth/login                Login (email + OAuth)
/auth/register             Register
/auth/onboarding           Profile setup wizard
/dashboard                 Main dashboard
/events                    Browse events (grid/list/calendar views)
/events/create             Multi-step event creation wizard
/events/[id]               Public event page (RSVP, tickets)
/events/[id]/manage        Organizer management panel
/events/[id]/attendees     Attendee list + invitations
/events/[id]/checkin       QR scanner check-in
/events/[id]/analytics     Charts, revenue, funnel
/calendar                  Full calendar (month/week/day)
/profile                   User profile + my events
/settings                  Account, notifications, integrations
```

---

## Database Schema

```prisma
enum Role { USER ADMIN }
enum EventStatus { DRAFT PUBLISHED CANCELLED COMPLETED }
enum RegistrationStatus { PENDING CONFIRMED WAITLISTED CANCELLED }
enum InvitationStatus { PENDING ACCEPTED DECLINED }

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?
  avatar        String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  events        Event[]
  registrations Registration[]
  coOrganizing  CoOrganizer[]
}

model Event {
  id            String      @id @default(cuid())
  title         String
  description   String
  coverImage    String?
  startDate     DateTime
  endDate       DateTime
  timezone      String
  location      String?
  isVirtual     Boolean     @default(false)
  meetingUrl    String?
  status        EventStatus @default(DRAFT)
  capacity      Int?
  isRecurring   Boolean     @default(false)
  recurringRule String?
  categoryId    String?
  organizerId   String
  organizer     User        @relation(fields: [organizerId], references: [id])
  category      Category?
  tickets       Ticket[]
  registrations Registration[]
  coOrganizers  CoOrganizer[]
  invitations   Invitation[]
  reminders     Reminder[]
  analytics     EventAnalytics?
}

model Ticket {
  id            String   @id @default(cuid())
  eventId       String
  name          String
  price         Float    @default(0)
  quantity      Int?
  sold          Int      @default(0)
  description   String?
}

model Registration {
  id              String             @id @default(cuid())
  eventId         String
  userId          String
  ticketId        String?
  status          RegistrationStatus
  qrCode          String             @unique
  checkedIn       Boolean            @default(false)
  checkedInAt     DateTime?
  createdAt       DateTime           @default(now())
  stripePaymentId String?
}

model Invitation {
  id        String           @id @default(cuid())
  eventId   String
  email     String
  status    InvitationStatus
  token     String           @unique
  sentAt    DateTime         @default(now())
}

model CoOrganizer {
  id       String @id @default(cuid())
  eventId  String
  userId   String
  role     String  // "editor" | "check-in-staff" | "viewer"
}

model Reminder {
  id          String   @id @default(cuid())
  eventId     String
  type        String
  scheduledAt DateTime
  sent        Boolean  @default(false)
}

model EventAnalytics {
  id             String @id @default(cuid())
  eventId        String @unique
  pageViews      Int    @default(0)
  totalRevenue   Float  @default(0)
  conversionRate Float  @default(0)
}

model Category {
  id     String @id @default(cuid())
  name   String
  color  String
  icon   String
  events Event[]
}

model DiscountCode {
  id          String   @id @default(cuid())
  eventId     String
  code        String   @unique
  discount    Float
  isPercent   Boolean  @default(true)
  usageLimit  Int?
  usedCount   Int      @default(0)
  expiresAt   DateTime?
}
```

---

## Features

### Authentication & Onboarding
- Email/password registration with hashed passwords (bcrypt)
- Google + GitHub OAuth via NextAuth.js
- Magic link login
- Onboarding wizard: avatar upload, display name, first event prompt

### Dashboard
- Stats cards: total events, upcoming, total attendees, total revenue
- Animated counters + sparkline mini-charts
- Upcoming events feed with quick actions
- Recent activity timeline

### Event Creation (6-step Wizard)
1. **Basics** — title, category, short description
2. **Details** — rich text description (TipTap), cover image (Cloudinary)
3. **Date & Location** — date/time pickers, timezone selector, physical/virtual toggle
4. **Tickets** — add ticket tiers (free or paid), set quantities
5. **Settings** — recurring rules, co-organizers, visibility, promo codes
6. **Review & Publish** — full preview before going live

### Attendee Management
- RSVP with automatic confirmation emails
- Waitlist with auto-promotion when capacity opens
- Bulk email invitations
- Co-organizer roles: editor, check-in staff, viewer
- Attendee search, filter, CSV export

### Ticketing & Payments
- Free ticket instant confirmation
- Paid tickets via Stripe Checkout
- Multiple ticket tiers (General, VIP, Early Bird)
- Promo/discount codes (percent or fixed)
- Stripe refund management
- Unique QR code generated per registration (emailed automatically)

### Check-in System
- Mobile-friendly QR scanner (camera, html5-qrcode)
- Manual attendee search fallback
- Real-time check-in counter via SSE
- Check-in rate display (checked-in / total registered)

### Analytics (per event)
- Attendance over time line chart
- Revenue breakdown by ticket type (pie + bar)
- Registration funnel: invited → registered → checked-in
- PDF/CSV export

### Calendar
- Month/Week/Day views (React Big Calendar)
- Color-coded events by category
- Google Calendar sync (OAuth)
- iCal import/export

### Notifications & Reminders
- Automated email reminders (24h before, 1h before, custom)
- In-app notification bell with unread count
- Event update broadcasts to all attendees
- Cancellation notice with auto-refund trigger

---

## Key API Routes

```
POST   /api/auth/[...nextauth]     NextAuth handler
POST   /api/events                 Create event
GET    /api/events                 List events (with filters)
GET    /api/events/[id]            Get event
PUT    /api/events/[id]            Update event
DELETE /api/events/[id]            Delete event
POST   /api/events/[id]/register   Register/RSVP
POST   /api/events/[id]/checkin    Check in attendee
GET    /api/events/[id]/analytics  Get analytics data
POST   /api/events/[id]/invite     Send invitations
POST   /api/stripe/webhook         Stripe payment webhooks
GET    /api/events/[id]/sse        SSE stream for real-time check-in
```

---

## Non-functional Requirements
- Mobile-responsive (all pages work on 375px+)
- Dark mode default, light mode toggle
- Optimistic UI updates where possible
- Loading skeletons on all data-fetching pages
- Error boundaries on all major sections
- Rate limiting on auth and invite endpoints
