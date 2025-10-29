# UI/UX Designer Handover Document

**Project:** RightFit Services - Property Maintenance SaaS Platform
**From:** Winston (System Architect)
**To:** UI/UX Designer
**Date:** 2025-10-27
**Status:** Ready for Design Phase

---

## 🎯 Project Overview

### What We're Building

A **mobile-first property maintenance platform** for UK landlords managing 1-50 long-term rental properties. Think "Trello for maintenance work orders" with offline capability.

**Core Value Proposition:**
> "Arthur Online's reliability without the outages, at half the price"

**Critical Differentiator:**
> Works offline in rural properties with no mobile signal (this is our moat)

### Target Users

**Primary User: Jamie - Remote Landlord**
- Age: 35-45
- Tech comfort: Medium (uses Airbnb, online banking, WhatsApp)
- Context: Visits properties monthly, often in rural areas with poor signal
- Pain point: Needs to document maintenance issues while on-site, even without internet

**Secondary User: Contractor (Phase 1)**
- Age: 30-55
- Tech comfort: Low-Medium (uses WhatsApp, basic apps)
- Context: Receives work orders, updates status, uploads "before/after" photos
- Pain point: Needs simple, fast app - can't have complicated workflows

---

## 📱 Technical Constraints (What You Need to Know)

### Platform

**Mobile:** React Native (iOS + Android)
- Single codebase for both platforms
- Material Design components (React Native Paper library)
- Must feel native, not like a web app in a wrapper

**Web:** React web app
- Desktop/laptop usage for dashboard, reporting, billing
- Material-UI component library (similar look to mobile)
- Not the primary experience - mobile is

### Key Technical Capabilities

✅ **Offline-first:** App must work with zero internet
✅ **Photo capture:** Camera integration for work order photos
✅ **Real-time updates:** Changes sync live across devices when online
✅ **Push notifications:** For urgent work orders
✅ **Geolocation:** Optional GPS tagging for photos

### Technical Limitations

❌ **No heavy animations:** Keep it performant on older Android phones
❌ **No video:** Photos only (budget constraint)
❌ **Limited custom fonts:** Stick to system fonts for performance
❌ **Keep bundle size small:** We're targeting users with limited data plans

---

## 🎨 Design Priorities (In Order)

### 1. Offline UX (CRITICAL - This is our differentiator)

**The Challenge:**
When landlords are on-site at rural properties, they often have ZERO internet for 30-60 minutes. The app MUST feel reliable offline.

**Design Requirements:**

**Clear Offline Indicator:**
```
┌─────────────────────────────┐
│  📡 Offline Mode            │  ← Persistent banner
│  Changes will sync when     │     (subtle, not alarming)
│  reconnected                │
└─────────────────────────────┘
```

**Pending Sync Queue Visibility:**
```
┌─────────────────────────────┐
│ ✓ 3 work orders created     │  ← Show what's queued
│ ✓ 5 photos captured         │
│ ⏳ Waiting to sync...       │
└─────────────────────────────┘
```

**Optimistic UI:**
- When user creates work order offline, show it IMMEDIATELY in the list
- Add subtle indicator (gray dot, "pending" badge) to show it's not synced yet
- When synced, indicator turns green briefly, then disappears

**Error States:**
```
┌─────────────────────────────┐
│ ⚠️ Sync Failed             │
│ "Heating failure" work      │
│ order couldn't sync.        │
│                             │
│ [Retry Now] [View Details]  │
└─────────────────────────────┘
```

### 2. Speed (Fast Feedback on Every Action)

**Performance Targets:**
- Button tap → visual feedback: <100ms
- Screen transition: <300ms
- Photo capture → preview: <500ms
- Work order creation: <2 seconds (even offline)

**Design Implications:**
- Use skeleton screens while loading (not spinners)
- Show progress for long operations (photo upload, sync)
- Instant feedback on taps (haptic feedback on iOS, ripple on Android)

### 3. Simplicity (Contractor Users Have Low Tech Comfort)

**UI Complexity Budget:**
- Max 3 taps to complete any core action
- No hidden menus or gestures (contractors won't discover them)
- Large tap targets (min 44x44pt)
- High contrast (outdoor visibility)

**Example: Create Work Order Flow**
```
Tap 1: "New Work Order" button
Tap 2: Select property from list
Tap 3: Fill title + priority → "Create"

Total: 3 taps, 1 form
```

### 4. Visual Hierarchy (Information Density)

**Mobile Screen Real Estate:**
- Landlords manage 1-20 properties
- Each property has 5-50 work orders over time
- Contractor sees 10-20 assigned work orders

**Design Pattern:**
Use **cards with status colors** heavily:

```
┌─────────────────────────────┐
│ 🔴 EMERGENCY               │ ← Color = Priority
│ Heating Failure             │
│ Highland Cabin #2           │
│                             │
│ Assigned to: John (Plumber) │
│ Due: Today 5pm              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🟡 MEDIUM                  │
│ Fix Leaky Tap               │
│ City Flat #3                │
│                             │
│ Not assigned yet            │
│ Due: Next week              │
└─────────────────────────────┘
```

**Color Coding:**
- 🔴 Red: Emergency (fix within 24 hours)
- 🟠 Orange: High (fix within 3 days)
- 🟡 Yellow: Medium (fix within week)
- 🟢 Green: Low (fix when convenient)

---

## 📋 Screens to Design (Priority Order)

### Phase 1: MVP Core Screens (Week 1-4 of Design)

#### Mobile App - Landlord View

**1. Login / Register**
- Email + password (simple)
- "Forgot password" link
- Option for biometric (Face ID / fingerprint) after first login
- Clean, trustworthy design (we're handling their business data)

**2. Properties List**
```
┌─────────────────────────────┐
│ My Properties          [+]  │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📷 Highland Cabin #2   │ │
│ │ Inverness, IV1 2AB     │ │
│ │ 3 active work orders   │ │
│ │ Next: Gas cert expires │ │
│ │       in 45 days       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📷 City Flat #3        │ │
│ │ Edinburgh, EH3 9QQ     │ │
│ │ 0 active work orders   │ │
│ │ All certificates valid │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Design Notes:**
- Property photo as background with overlay for readability
- Active work order count prominent (red if >3)
- Certificate status as secondary info
- Pull-to-refresh to sync

**3. Property Details**
```
┌─────────────────────────────┐
│ ← Highland Cabin #2    ⋮   │
│                             │
│ 📷 Property Photo          │
│                             │
│ 📍 123 Highland Rd          │
│    Inverness, IV1 2AB       │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Work Orders (3 active)      │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔴 Heating Failure     │ │
│ │ In Progress • John      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🟡 Leaky Tap           │ │
│ │ Open • Not assigned     │ │
│ └─────────────────────────┘ │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Certificates               │
│ ✅ Gas Safety (valid)      │
│ ⚠️ Electrical (45 days)    │
│ ✅ EPC (valid)             │
│                             │
│ [+ New Work Order]          │
└─────────────────────────────┘
```

**Design Notes:**
- Work orders prominently at top (most common action)
- Certificates below (important but less frequent)
- FAB (Floating Action Button) for "New Work Order"

**4. Create Work Order**
```
┌─────────────────────────────┐
│ ← New Work Order      [Save]│
│                             │
│ Property                    │
│ Highland Cabin #2      ▼   │
│                             │
│ Title                       │
│ ┌─────────────────────────┐ │
│ │ e.g., "Broken window"  │ │
│ └─────────────────────────┘ │
│                             │
│ Priority                    │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│ │🔴│ │🟠│ │🟡│ │🟢│   │ ← Large tap targets
│ └───┘ └───┘ └───┘ └───┘   │
│ Emerg High  Med   Low      │
│                             │
│ Category                    │
│ Plumbing                ▼  │
│                             │
│ Description (optional)      │
│ ┌─────────────────────────┐ │
│ │                        │ │
│ │                        │ │
│ └─────────────────────────┘ │
│                             │
│ Photos (optional)           │
│ [📷 Take Photo]            │
│                             │
│ Assign Contractor (optional)│
│ None                    ▼  │
└─────────────────────────────┘
```

**Design Notes:**
- Keep form short (mobile context, often outdoors)
- Priority as color buttons (visual, fast)
- Photos optional but prominent
- Can assign contractor immediately or leave for later

**5. Work Order Details**
```
┌─────────────────────────────┐
│ ← Heating Failure       ⋮  │
│                             │
│ Status: In Progress         │
│ ┌─────────────────────────┐ │
│ │ Open → Assigned →       │ │
│ │ In Progress → Completed │ │
│ │        ●  (you are here)│ │
│ └─────────────────────────┘ │
│                             │
│ 🔴 Emergency • Plumbing    │
│ Created: Today 2:34pm       │
│ Due: Today 5:00pm           │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Property                    │
│ Highland Cabin #2           │
│                             │
│ Assigned To                 │
│ John Smith (Highland Heating)│
│ [📞 Call] [💬 Message]     │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Photos                      │
│ ┌─────┐ ┌─────┐            │
│ │ 📷  │ │ 📷  │   Before   │
│ └─────┘ └─────┘            │
│                             │
│ ┌─────┐                    │
│ │ 📷  │        During      │
│ └─────┘                    │
│                             │
│ No "after" photos yet       │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Updates                     │
│ 2:45pm John accepted job    │
│ 3:10pm John started work    │
│ 3:25pm John added photo     │
└─────────────────────────────┘
```

**Design Notes:**
- Status progress bar (clear visual of where we are)
- Contact contractor buttons prominent (common action)
- Photos organized by label (Before/During/After)
- Timeline of updates (who did what when)

**6. Camera / Photo Capture**
```
┌─────────────────────────────┐
│                             │
│                             │
│          CAMERA             │
│          VIEWFINDER         │
│                             │
│                             │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⚡ Flash  🔄 Flip       │ │ ← Camera controls
│ └─────────────────────────┘ │
│                             │
│         ⃝  CAPTURE          │ ← Big button
│                             │
│ [Gallery]          [Cancel] │
└─────────────────────────────┘
```

After capture:
```
┌─────────────────────────────┐
│ ← Photo Preview             │
│                             │
│      PHOTO PREVIEW          │
│                             │
│ Label this photo            │
│ ┌───┐ ┌───┐ ┌───┐         │
│ │ B │ │ D │ │ A │         │
│ └───┘ └───┘ └───┘         │
│ Before During After         │
│                             │
│ ✓ Photo looks clear         │ ← AI quality check
│ ✓ Good lighting             │    (subtle, not blocking)
│                             │
│ [Retake]           [Use]    │
└─────────────────────────────┘
```

#### Mobile App - Contractor View (Simplified)

**7. Contractor Work Order List**
```
┌─────────────────────────────┐
│ My Jobs            🔔 (3)  │
│                             │
│ Emergency (1)               │
│ ┌─────────────────────────┐ │
│ │ 🔴 Heating Failure     │ │
│ │ Highland Cabin #2       │ │
│ │ Assigned 10 min ago     │ │
│ │ [Accept Job]            │ │ ← Clear CTA
│ └─────────────────────────┘ │
│                             │
│ In Progress (2)             │
│ ┌─────────────────────────┐ │
│ │ 🟡 Leaky Tap           │ │
│ │ City Flat #3            │ │
│ │ Started 1h ago          │ │
│ └─────────────────────────┘ │
│                             │
│ Completed (5)          [>] │
└─────────────────────────────┘
```

**Design Notes:**
- Emergency jobs at top with accept button
- Clear grouping by status
- Minimal info (contractor just needs location + issue)
- Large, finger-friendly buttons

**8. Contractor - Update Work Order**
```
┌─────────────────────────────┐
│ ← Heating Failure           │
│                             │
│ Highland Cabin #2           │
│ 123 Highland Rd, Inverness  │
│ [📍 Get Directions]         │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Access Instructions         │
│ "Key under mat, lockbox     │
│  code 1234"                 │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ Current Status              │
│ In Progress                 │
│                             │
│ [Start Work]                │ ← Big, obvious
│ [Add Photo]                 │    actions
│ [Add Note]                  │
│ [Mark Complete]             │
│                             │
│ Photos (2)                  │
│ ┌─────┐ ┌─────┐            │
│ │ 📷  │ │ 📷  │            │
│ └─────┘ └─────┘            │
└─────────────────────────────┘
```

**Design Notes:**
- Directions prominent (contractors need to navigate)
- Access instructions visible (avoid phone calls)
- Large action buttons (may be wearing gloves)
- Photo gallery to show what they've captured

### Phase 2: Web Dashboard (Week 5-6 of Design)

**9. Web Dashboard (Desktop)**
```
┌────────────────────────────────────────────────────────┐
│ RightFit Services                    Jamie (Landlord) ▼│
├────────────┬───────────────────────────────────────────┤
│            │                                           │
│ Dashboard  │  Overview                                 │
│ Properties │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ Work Orders│  │    12    │ │    3     │ │    2     │  │
│ Contractors│  │Properties│ │ Active   │ │ Expiring │  │
│ Calendar   │  │          │ │ Work     │ │ Certs    │  │
│ Settings   │  │          │ │ Orders   │ │          │  │
│            │  └──────────┘ └──────────┘ └──────────┘  │
│            │                                           │
│            │  Recent Work Orders                       │
│            │  ┌────────────────────────────────────┐   │
│            │  │🔴 Heating Failure                 │   │
│            │  │  Highland Cabin #2                │   │
│            │  │  In Progress • John Smith         │   │
│            │  ├────────────────────────────────────┤   │
│            │  │🟡 Leaky Tap                       │   │
│            │  │  City Flat #3                     │   │
│            │  │  Open • Not assigned              │   │
│            │  └────────────────────────────────────┘   │
│            │                                           │
│            │  Upcoming Certificate Renewals            │
│            │  ⚠️ Highland Cabin #2 - Electrical (45d) │
│            │  ✅ City Flat #3 - Gas Safety (valid)    │
└────────────┴───────────────────────────────────────────┘
```

**Design Notes:**
- Sidebar navigation (standard desktop pattern)
- Dashboard with key metrics
- Recent activity feed
- Responsive (works on tablets too)

---

## 🎨 Visual Design Guidelines

### Color Palette

**Primary Colors:**
- **Brand Blue:** #2563EB (primary actions, buttons)
- **Brand Dark:** #1E40AF (navigation, headers)

**Status Colors:**
- **Emergency:** #DC2626 (red)
- **High Priority:** #F97316 (orange)
- **Medium Priority:** #FBBF24 (yellow)
- **Low Priority:** #10B981 (green)
- **Success:** #22C55E (completed, synced)
- **Warning:** #F59E0B (expiring soon)
- **Error:** #EF4444 (sync failed, error)

**Neutral Colors:**
- **Text Primary:** #111827 (headings, important text)
- **Text Secondary:** #6B7280 (labels, metadata)
- **Background:** #F9FAFB (app background)
- **Surface:** #FFFFFF (cards, modals)
- **Border:** #E5E7EB (dividers, card borders)

### Typography

**Mobile (React Native Paper default):**
- **Headings:** Roboto Bold, 20-24pt
- **Body:** Roboto Regular, 16pt
- **Labels:** Roboto Medium, 14pt
- **Metadata:** Roboto Regular, 12pt

**Web (Material-UI default):**
- **Headings:** Roboto Bold, 24-32px
- **Body:** Roboto Regular, 16px
- **Labels:** Roboto Medium, 14px

**Accessibility:**
- Minimum text size: 14pt/px
- Contrast ratio: 4.5:1 minimum (WCAG AA)
- No text on photos without overlay

### Spacing System

Use 8pt grid:
- **Tiny:** 4pt (between related items)
- **Small:** 8pt (between form fields)
- **Medium:** 16pt (between sections)
- **Large:** 24pt (between major components)
- **XLarge:** 32pt (top/bottom screen padding)

### Components to Design

**Buttons:**
- **Primary:** Filled blue (#2563EB), white text
- **Secondary:** Outlined blue, blue text
- **Destructive:** Filled red, white text
- **Minimum size:** 44x44pt (iOS) / 48x48dp (Android)

**Cards:**
- White background
- 1pt border (#E5E7EB)
- 8pt border radius
- Subtle shadow on mobile
- Hover state on web

**Status Badges:**
- Pill shape (fully rounded ends)
- Colored background at 10% opacity
- Colored text
- Example: 🔴 EMERGENCY (red background, red text)

**Forms:**
- Labels above inputs
- 16pt input text size (avoid mobile zoom)
- Clear error states (red border + message below)
- Validation on blur, not on every keystroke

### Icons

**Icon Library:** Material Icons (comes with React Native Paper and MUI)

**Commonly Used Icons:**
- Property: `home`
- Work Order: `build`
- Contractor: `person`
- Photo: `camera_alt`
- Calendar: `event`
- Settings: `settings`
- Add: `add_circle`
- Offline: `cloud_off`
- Syncing: `sync`
- Complete: `check_circle`
- Warning: `warning`

**Icon Sizes:**
- Small: 16pt (inline with text)
- Medium: 24pt (list items, buttons)
- Large: 48pt (empty states)

---

## 📸 Photo Guidelines (Critical for This App)

### Photo Capture UX

**Before Capture:**
- Fullscreen camera viewfinder
- Flash toggle visible (properties often have poor lighting)
- Grid overlay (optional, helps with composition)

**After Capture:**
- Immediate preview (full screen)
- AI quality check feedback:
  - ✅ "Photo looks good"
  - ⚠️ "Photo is dark - retake with flash?"
  - ⚠️ "Photo is blurry - hold still and try again"
- Retake vs Use buttons (equal prominence)

**Photo Organization:**
- Group by label (Before, During, After)
- Thumbnail grid (3 columns on mobile)
- Tap to view fullscreen
- Metadata visible (date, time, who uploaded)

### Photo Quality Feedback (AI-Powered)

```
After photo upload:

✅ Photo Quality: Good
   • Brightness: ✓
   • Focus: ✓
   • Content detected: Heating unit

⚠️ Photo Quality: Could be better
   • Too dark - try using flash
   • Focus: ✓
   • Content detected: Bathroom

❌ Photo Quality: Poor
   • Very blurry - please retake
   • Brightness: ✓
   • Content unclear
```

**Design Notes:**
- Non-blocking (user can proceed anyway)
- Educational (explain why photo is poor)
- Positive reinforcement (green check for good photos)

---

## 🔔 Notifications Design

### Push Notifications (Mobile)

**Emergency Work Order Assigned (Contractor):**
```
🔴 Emergency Work Order
Heating failure at Highland Cabin #2
Tap to accept job →
```

**Work Order Completed (Landlord):**
```
✅ Work order completed
John completed "Heating failure"
View details →
```

**Certificate Expiring (Landlord):**
```
⚠️ Certificate expires in 30 days
Gas Safety - Highland Cabin #2
Schedule renewal →
```

**Design Notes:**
- Use emoji for quick visual scan
- One clear action per notification
- Deep link to relevant screen

### In-App Notifications

```
┌─────────────────────────────┐
│ Notifications          [×]  │
│                             │
│ 🔴 New emergency work order │
│    Highland Cabin #2        │
│    5 minutes ago            │
│                             │
│ ✅ John completed work order│
│    "Leaky Tap"              │
│    1 hour ago               │
│                             │
│ ⚠️ Certificate expiring     │
│    Electrical - 30 days     │
│    2 days ago               │
└─────────────────────────────┘
```

---

## ♿ Accessibility Requirements

### Must Support

✅ **Screen Readers:** VoiceOver (iOS), TalkBack (Android)
✅ **Dynamic Type:** Text scales with system font size settings
✅ **High Contrast Mode:** Works with system accessibility settings
✅ **Keyboard Navigation:** (Web only) Tab order makes sense
✅ **Touch Targets:** Minimum 44x44pt (iOS), 48x48dp (Android)

### Testing Checklist

- [ ] All images have alt text
- [ ] All buttons have labels (even icon-only buttons)
- [ ] Form errors announced to screen readers
- [ ] Color is not the only indicator (use icons + text too)
- [ ] Tap targets don't overlap
- [ ] Text scales to 200% without breaking layout

---

## 📐 Responsive Design Breakpoints

### Mobile (React Native)

Design for:
- **iPhone SE (small):** 320pt width
- **iPhone 14 (medium):** 390pt width
- **iPhone 14 Pro Max (large):** 430pt width
- **Android (varies):** 360dp typical

**Strategy:** Single column, vertical scroll

### Web (React)

Breakpoints:
- **Mobile:** 0-640px (single column)
- **Tablet:** 641-1024px (sidebar collapsible)
- **Desktop:** 1025px+ (sidebar always visible)

**Strategy:** Progressive enhancement from mobile-first

---

## 🖼️ Design Deliverables Needed

### Phase 1 (Week 1-4)

**Mobile Screens (High Fidelity):**
1. Login / Register
2. Properties List
3. Property Details
4. Create Work Order
5. Work Order Details
6. Camera / Photo Capture
7. Contractor - Work Order List
8. Contractor - Update Work Order

**Component Library:**
- Buttons (primary, secondary, destructive)
- Status badges (emergency, high, medium, low)
- Cards (work order card, property card)
- Forms (inputs, dropdowns, textareas)
- Offline banner
- Sync progress indicator

**User Flows:**
- Create work order (online)
- Create work order (offline → sync)
- Contractor accepts job → updates status → uploads photo → completes
- Photo capture → AI quality check → retake or use

### Phase 2 (Week 5-6)

**Web Screens (High Fidelity):**
9. Dashboard
10. Properties List (table view)
11. Work Orders List (kanban board)
12. Calendar View

**Responsive Layouts:**
- Mobile, Tablet, Desktop versions of all web screens

---

## 🎯 Success Metrics (How We'll Measure Your Design)

**Time to Complete Core Tasks:**
- Create work order: <60 seconds (target: <30 seconds)
- Upload photo: <20 seconds
- Accept job (contractor): <10 seconds

**User Feedback:**
- "Easy to use" rating: >4.5/5 stars
- Contractor onboarding: <5 minutes to first job acceptance

**Technical Metrics:**
- Offline mode clearly understood: >90% of users know when offline
- Photo retake rate: <20% (means AI quality checks are helpful, not annoying)

---

## 🚫 What NOT to Design (Out of Scope for MVP)

❌ Cleaner portal (Phase 2)
❌ Tenant portal (Phase 2)
❌ Calendar view (Phase 2)
❌ Invoicing UI (Phase 2)
❌ Reporting/analytics dashboards (Phase 2)
❌ Team management / multi-user (Phase 2)
❌ Custom branding per tenant (Phase 2)

---

## 📚 Reference Materials

### Competitors to Review (UX Patterns)

**Property Management:**
- Arthur Online (competitor - check their mobile app)
- Landlord Studio (competitor)
- Buildium (US competitor, good UX patterns)

**Offline-First Apps:**
- Notion (mobile offline mode)
- Google Drive (offline sync indicators)
- Trello (offline card creation)

**Field Service Apps:**
- ServiceTitan (contractor workflows)
- Jobber (work order management)
- Workiz (simple contractor app)

### Design System References

- **Material Design 3:** https://m3.material.io
- **iOS Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines
- **React Native Paper:** https://reactnativepaper.com (see component demos)

---

## 🤝 Collaboration

### Design → Development Handoff

**Tools:**
- Figma (preferred) or Adobe XD
- Export assets at 1x, 2x, 3x for mobile
- Provide design tokens (colors, spacing, typography as JSON)
- Annotate interactions (swipe, long-press, etc.)

### Questions Welcome

**Slack me (@winston-architect) or email for:**
- Technical feasibility questions ("Can we do X?")
- Performance concerns ("Will this be slow?")
- Platform limitations ("Does React Native support Y?")

### Review Cadence

- **Week 1:** Initial concepts (low-fi sketches)
- **Week 2:** High-fi mockups (3-4 key screens)
- **Week 3:** Complete mobile flow
- **Week 4:** Component library + user flows
- **Week 5-6:** Web dashboard

---

## ✅ Final Checklist (Before Handoff to Dev)

- [ ] All screens designed at 1x, 2x, 3x resolution
- [ ] Offline states shown for all key screens
- [ ] Error states designed (sync failed, photo upload failed, etc.)
- [ ] Empty states designed (no properties yet, no work orders yet)
- [ ] Loading states designed (skeleton screens preferred over spinners)
- [ ] Component library documented (buttons, cards, forms)
- [ ] Color palette exported as design tokens
- [ ] Typography scale defined
- [ ] Spacing system documented (8pt grid)
- [ ] Accessibility notes added (tap target sizes, contrast ratios)
- [ ] User flows annotated (interaction notes, transitions)
- [ ] Mobile + web responsive breakpoints defined

---

## 🎨 Winston's Final Design Philosophy

**Remember:**

1. **Offline-first is our moat** - Make it feel reliable, not broken
2. **Contractors have thick fingers** - Big buttons, high contrast
3. **Landlords are busy** - Fast, obvious workflows
4. **Photos are proof** - Make capture easy, quality checks subtle
5. **Simple beats clever** - No hidden gestures, no complex navigation

**You're designing for people managing real properties with real tenants. Reliability and clarity beat beautiful animations.**

Good luck! Can't wait to see what you create. 🏗️

---

**Questions? Ping me on Slack or email: winston@rightfit.internal**

