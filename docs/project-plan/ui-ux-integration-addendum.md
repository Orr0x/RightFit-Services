# Project Plan - UI/UX Integration Addendum

**Document Version:** 1.0
**Date:** 2025-10-27
**Project Manager:** John (PM Agent)
**Status:** Addendum to Sprint Plans based on UI Expert Review

---

## Executive Summary

After reviewing Sally's comprehensive UI/UX specification (`docs/architecture/front-end-spec.md`), several adjustments are needed to the original sprint plans to account for design complexity and UX requirements. This addendum documents the changes and ensures successful collaboration between design and development workstreams.

---

## Key UX Findings Impacting Timeline

### 1. Design System Setup (Sprint 1 Impact)

**UX Specification Requirements:**
- React Native Paper (mobile) + Material-UI (web) component libraries
- Custom theme with design tokens (colors, spacing, typography)
- Component library in Figma with variants and states
- Design tokens exported as JSON for developers

**Original Sprint 1 Estimate:** 8 hours for monorepo setup
**Revised Estimate:** **10 hours** (add 2 hours for design system integration)

**Added Tasks:**
- Import and configure React Native Paper theme
- Configure Material-UI theme with custom colors
- Create shared theme constants in `packages/shared/src/theme/`
- Test component rendering with custom theme

**Recommendation:** Developer should wait for Sally to export design tokens before finalizing theme configuration. Can use Material Design defaults temporarily.

---

### 2. Camera/Photo Capture Complexity (Sprint 3 & 5 Impact)

**UX Specification Requirements:**
- Fullscreen camera viewfinder with controls (flash toggle, flip camera, grid overlay)
- Photo preview with pinch-to-zoom
- AI quality check feedback UI (3 states: Good/Could be Better/Poor)
- Photo labeling picker (Before/During/After)
- High-contrast controls for outdoor use
- Haptic feedback on capture (iOS)

**Original Sprint 3 Estimate:** US-Mobile-8 (Camera Photo Upload) - 10 hours
**Revised Estimate:** **12 hours** (add 2 hours for complex UI states)

**Original Sprint 5 Estimate:** US-AI-2 (Photo Quality Check Warning) - 6 hours
**Revised Estimate:** **8 hours** (add 2 hours for feedback UI implementation)

**Total Impact:** +4 hours across Sprint 3 and 5

**Recommendation:**
- Sprint 3: Implement basic camera functionality (capture, preview, save)
- Sprint 5: Add AI quality check UI overlay and feedback states

---

### 3. Offline Sync UI Visibility (Sprint 4 Impact)

**UX Specification Requirements:**
- Persistent offline banner with 4 states (Offline/Syncing/Synced/Failed)
- Expandable sync queue screen showing pending items
- Progress indicators for sync operations
- Color-coded states with icons and messages
- Auto-dismiss banner after sync complete (3s)

**Original Sprint 4 Estimate:** Offline mode included basic sync queue - 56 hours total
**Revised Estimate:** **Add 4 hours** for comprehensive sync UI

**New Task: US-Offline-7 (4 hours):**
**As a** landlord
**I want** clear visibility into what's syncing and sync status
**So that** I trust the offline mode

**Acceptance Criteria:**
- [x] Persistent banner at top showing offline status
- [x] Banner has 4 visual states (colors, icons, messages)
- [x] Tap banner → navigate to Sync Queue screen
- [x] Sync Queue screen shows: item type, status (pending/syncing/synced/failed), retry button
- [x] Banner auto-dismisses after successful sync (3s delay)

**Total Sprint 4 Revised:** 60 hours (was 56 hours)

---

### 4. Work Order Card Component (Sprint 2 Impact)

**UX Specification Requirements:**
- Color-coded left border (4pt) for priority
- Multiple states (default, hover, selected, offline pending, synced)
- Structured anatomy (header, metadata rows, footer)
- Truncation rules (2 lines max for title)
- "Overdue" badge if past due date

**Original Sprint 2:** Work order UI included in US-WO-2 (List Work Orders) - 5 hours
**Revised Estimate:** **6 hours** (add 1 hour for component states and polish)

---

### 5. Accessibility Implementation (All Sprints Impact)

**UX Specification Requirements:**
- WCAG 2.1 Level AA compliance
- Screen reader support (VoiceOver, TalkBack)
- Keyboard navigation (web)
- Minimum touch target size (44x44pt iOS, 48x48dp Android)
- Color contrast ratios (4.5:1 for normal text)
- Focus indicators on all interactive elements

**Impact:** Adds ~10% overhead to UI implementation tasks

**Recommendation:**
- Test with VoiceOver/TalkBack during Sprint 3-6 (not after launch)
- Add accessibility testing to Definition of Done for UI components
- Budget 2-3 hours per sprint for accessibility fixes

---

## Design-Development Coordination

### Parallel Workstream Required

**Critical:** Design work must start BEFORE development to avoid blocking developers.

**Recommended Timeline:**

```
Week 1-2 (Sprint 1): Design Foundation
├─ Sally creates Figma workspace
├─ Sets up component library (buttons, cards, forms)
├─ Defines color palette and typography
├─ Exports design tokens as JSON
└─ Developer uses design tokens for theme setup

Week 3-4 (Sprint 2): Design Core Screens
├─ Sally designs: Login, Properties List, Property Details, Create Work Order
├─ Creates interactive prototypes for user testing
├─ Developer implements Sprint 1 features (not blocked)
└─ Weekly design review (Sally + PM + Developer)

Week 5-6 (Sprint 3): Design Mobile Screens
├─ Sally designs: Camera/Photo flow, Work Order Details
├─ Refines designs based on Sprint 2 feedback
├─ Developer implements Sprint 2 features
└─ Design handoff for Sprint 3 screens

Week 7-8 (Sprint 4): Design Offline UI
├─ Sally designs: Offline banner, Sync Queue screen
├─ Documents states and transitions
├─ Developer implements Sprint 3 features
└─ Design handoff for Sprint 4 screens

Week 9-10 (Sprint 5): Design Contractor View
├─ Sally designs: Contractor job list, Work Order Details (contractor view)
├─ Finalizes all mobile designs
├─ Developer implements Sprint 4 features
└─ Design handoff for Sprint 5 screens

Week 11-12 (Sprint 6): Design QA & Web Dashboard (Optional)
├─ Sally reviews implemented designs (design QA)
├─ Documents bugs and polish items
├─ Optionally starts web dashboard designs (Phase 2)
└─ Developer implements Sprint 5 and polishes Sprint 6
```

---

## Revised Sprint Capacity

### Sprint 1 (Week 1-2)
- **Original:** 50 hours
- **Revised:** 52 hours (+2 hours for design system setup)
- **Status:** ⚠️ Slightly over capacity (developer can work 2 extra hours or defer 1 small task)

### Sprint 2 (Week 3-4)
- **Original:** 50 hours
- **Revised:** 51 hours (+1 hour for work order card states)
- **Status:** ✅ Within capacity

### Sprint 3 (Week 5-6)
- **Original:** 53 hours
- **Revised:** 55 hours (+2 hours for camera UI complexity)
- **Status:** ⚠️ Slightly over capacity (consider deferring 1 story to Sprint 4)

### Sprint 4 (Week 7-8)
- **Original:** 56 hours
- **Revised:** 60 hours (+4 hours for sync UI visibility)
- **Status:** 🚨 Over capacity - **MUST ADJUST**

**Sprint 4 Mitigation Options:**
1. **Extend Sprint 4 by 2 days** (push Sprint 5 and 6 by 2 days each, launch Week 13 Day 2)
2. **Defer conflict resolution (US-Offline-6)** to Phase 2 (saves 6 hours, launch on time)
3. **Simplify sync UI** (skip Sync Queue screen, show banner only - saves 2 hours)

**Recommendation:** Option 2 - Defer conflict resolution to Phase 2. For MVP, last-write-wins is acceptable. Add comprehensive conflict resolution in Month 4-5 based on beta feedback.

### Sprint 5 (Week 9-10)
- **Original:** 42 hours
- **Revised:** 44 hours (+2 hours for AI feedback UI)
- **Status:** ✅ Within capacity

### Sprint 6 (Week 11-12)
- **Original:** 53 hours
- **Revised:** 53 hours (no change)
- **Status:** ✅ Within capacity

---

## Updated Risk Register

### New Risk: R14 - Design-Development Misalignment

**Category:** Process
**Impact:** Medium (delays sprints by 2-5 days if developer blocked)
**Probability:** Medium (30% without coordination)
**Risk Score:** ⚠️ MODERATE

**Description:**
Developer starts implementing features before designs are ready, leading to:
- Rework when designs are finalized
- Developer blocked waiting for designs
- Inconsistent UI implementation (developer guesses design)

**Indicators:**
- Week 2: Design tokens not exported yet, developer using Material defaults
- Week 4: Developer implementing features without finalized designs
- Week 6: Developer requests design clarifications, Sally not responsive

**Mitigation Strategies:**
1. **Design Ahead:** Sally designs screens 1-2 sprints ahead of development
2. **Weekly Sync:** Sally + Developer + PM meet every Monday (30 min design handoff)
3. **Figma Sharing:** Developer has view-only access to Figma, can inspect designs anytime
4. **Progressive Refinement:** Developer implements with Material defaults, Sally polishes in next sprint
5. **Design QA:** Sally reviews implemented designs weekly, logs polish items in GitHub

**Contingency Plan:**
- **Developer blocked on designs:** Implement with Material Design defaults, refine later
- **Sally unavailable:** PM provides design direction based on UX spec, Sally reviews asynchronously
- **Major design changes late:** Evaluate impact on timeline, consider deferring changes to Phase 2

**Owner:** PM
**Status:** Open
**Last Reviewed:** 2025-10-27
**Next Review:** Weekly (during Sprint 1-6)

---

## Updated Sprint 4 Plan (Recommended Adjustments)

### Deferred to Phase 2: US-Offline-6 (Conflict Resolution)

**Rationale:**
- Conflict resolution is edge case (rare for solo landlord to edit same work order on multiple devices simultaneously)
- Last-write-wins is acceptable for MVP (server version overwrites local)
- Can add sophisticated conflict resolution in Month 4-5 based on beta feedback
- Saves 6 hours in Sprint 4 (brings total from 60 hours → 54 hours, within capacity)

**Updated Sprint 4 Capacity:**
- **Revised:** 54 hours (deferred US-Offline-6)
- **Status:** ✅ Within capacity (40-60 hours)

**Phase 2 Backlog:**
- Add US-Offline-6 (Conflict Resolution) to Month 4-5 iteration roadmap
- Implement if beta users report data conflicts (monitor during beta testing)

---

## Design Deliverables Checklist (Sally's Responsibilities)

### Week 1-2 (Before Sprint 1 Complete)
- [x] Figma workspace created (`rightfit-components-library.fig`)
- [ ] Component library: Buttons, Cards, Form Inputs, Badges
- [ ] Color palette defined in Figma (matches UX spec colors)
- [ ] Typography scale defined in Figma
- [ ] Design tokens exported as JSON (`design-tokens.json`)
- [ ] Share Figma link with developer (view-only access)

### Week 3-4 (Before Sprint 2 Complete)
- [ ] High-fidelity designs: Login, Register screens
- [ ] High-fidelity designs: Properties List, Property Details
- [ ] High-fidelity designs: Create Work Order form
- [ ] Interactive prototype for user testing (Login → Create Work Order flow)
- [ ] Assets exported (icons at 1x/2x/3x, property placeholder images)

### Week 5-6 (Before Sprint 3 Complete)
- [ ] High-fidelity designs: Work Order Details
- [ ] High-fidelity designs: Camera/Photo Capture flow (6 states)
- [ ] High-fidelity designs: Photo Gallery component
- [ ] Interactive prototype: Camera flow with AI quality check
- [ ] Annotate interactions (swipe, pinch-to-zoom, haptic feedback)

### Week 7-8 (Before Sprint 4 Complete)
- [ ] High-fidelity designs: Offline banner (4 states)
- [ ] High-fidelity designs: Sync Queue screen
- [ ] Animation specifications (slide-down, progress indicators)
- [ ] Interactive prototype: Offline → Online transition

### Week 9-10 (Before Sprint 5 Complete)
- [ ] High-fidelity designs: Contractor - My Jobs List
- [ ] High-fidelity designs: Contractor - Work Order Details
- [ ] High-fidelity designs: Certificate upload/list screens
- [ ] All mobile designs finalized (ready for developer handoff)

### Week 11-12 (Sprint 6)
- [ ] Design QA on implemented screens (compare Figma vs. app)
- [ ] Document polish items (spacing, colors, typography issues)
- [ ] Create GitHub issues for design bugs
- [ ] Optional: Start web dashboard designs (Phase 2)

---

## Developer Handoff Process

### Weekly Design Handoff (Every Monday, 30 minutes)

**Attendees:** Sally (UX), Developer, PM

**Agenda:**
1. **Review Last Week (5 min):**
   - Developer shows implemented designs from last sprint
   - Sally provides feedback, logs issues in GitHub
2. **This Week's Designs (15 min):**
   - Sally presents designs for current sprint
   - Developer asks clarifying questions
   - PM notes any scope changes
3. **Next Week Preview (5 min):**
   - Sally previews next sprint's designs (if ready)
   - Developer flags any concerns
4. **Action Items (5 min):**
   - Sally: Export assets, update Figma, answer questions
   - Developer: Implement designs, flag blockers
   - PM: Track action items, update sprint plan

### Asynchronous Communication

**Slack Channel:** `#rightfit-design`

**Response Time Expectations:**
- **Urgent blockers** (developer can't proceed): <2 hours
- **Clarifying questions** (design details): <24 hours (weekdays)
- **Feedback on implementations**: <48 hours

**Figma Commenting:**
- Developer can comment directly on Figma designs with questions
- Sally responds in Figma comments (visible to PM)
- PM monitors Figma activity weekly

---

## Accessibility Testing Plan

### Per-Sprint Accessibility Checklist

**Sprint 1-2 (Foundation):**
- [ ] Color contrast ratios meet WCAG AA (4.5:1)
- [ ] Button touch targets ≥44x44pt (iOS) / ≥48x48dp (Android)
- [ ] Form inputs have labels (not placeholder-only)
- [ ] Error messages visible and associated with inputs

**Sprint 3 (Mobile App):**
- [ ] Screen reader navigation works (VoiceOver, TalkBack)
- [ ] Tab order is logical (top-to-bottom, left-to-right)
- [ ] Images have alt text (property photos, icons)
- [ ] Camera permissions modal has clear messaging

**Sprint 4 (Offline Mode):**
- [ ] Offline banner announced to screen readers (ARIA live region)
- [ ] Sync status changes announced
- [ ] Focus doesn't get trapped in banner

**Sprint 5 (AI + Compliance):**
- [ ] Photo quality feedback announced to screen readers
- [ ] Certificate expiry warnings accessible
- [ ] Push notification content descriptive

**Sprint 6 (Payments + Polish):**
- [ ] Payment forms accessible (labels, errors, success messages)
- [ ] Settings screens keyboard navigable
- [ ] Final accessibility audit with automated tools (axe-core)

---

## Performance Budget Tracking

### Per-Sprint Performance Goals

**Sprint 1:**
- [ ] App launch time: <2s cold start (test on iPhone 11)
- [ ] Authentication screens render: <500ms

**Sprint 2:**
- [ ] Properties list load: <1s on 3G connection
- [ ] Photo upload to S3: <10s on 4G (5MB photo)

**Sprint 3:**
- [ ] Camera preview opens: <500ms from tap
- [ ] Photo preview displays: <300ms after capture
- [ ] Screen transitions: <300ms (all navigation)

**Sprint 4:**
- [ ] Offline work order creation: <2s (save to local DB)
- [ ] Sync queue processes 10 items: <30s on 4G

**Sprint 5:**
- [ ] AI quality check returns: <1s (Google Vision API)
- [ ] Push notification delivery: <5s from trigger

**Sprint 6:**
- [ ] All animations at 60fps (no dropped frames)
- [ ] Bundle size: <50MB (iOS), <40MB (Android)

### Testing Tools

- **Xcode Instruments** (iOS performance profiling)
- **Android Profiler** (Android performance profiling)
- **React DevTools Profiler** (React component performance)
- **Lighthouse** (web performance, accessibility, SEO)

---

## Summary of Changes

### Sprint Plans Updated

| Sprint | Original Hours | Added Hours | New Total | Status |
|--------|---------------|-------------|-----------|--------|
| Sprint 1 | 50 | +2 (design system) | 52 | ⚠️ Slightly over |
| Sprint 2 | 50 | +1 (card states) | 51 | ✅ OK |
| Sprint 3 | 53 | +2 (camera UI) | 55 | ⚠️ Slightly over |
| Sprint 4 | 56 | +4 (sync UI) -6 (deferred) | 54 | ✅ OK |
| Sprint 5 | 42 | +2 (AI feedback UI) | 44 | ✅ OK |
| Sprint 6 | 53 | 0 | 53 | ✅ OK |
| **Total** | **304** | **+5** | **309** | ✅ OK |

**Net Impact:** +5 hours across 6 sprints (manageable)

### Key Decisions

1. ✅ **Defer US-Offline-6 (Conflict Resolution)** to Phase 2 - Saves 6 hours in Sprint 4
2. ✅ **Design work starts in parallel** - Sally designs 1-2 sprints ahead
3. ✅ **Weekly design handoff meetings** - Mondays, 30 minutes
4. ✅ **Progressive refinement allowed** - Developer uses Material defaults, Sally polishes later
5. ✅ **Accessibility testing per sprint** - Not just final QA

### Risks Mitigated

- **R14 (Design-Development Misalignment):** Parallel design workstream, weekly handoffs
- **R08 (Monorepo Setup Complexity):** Added 2 hours for design system integration
- **R02 (Offline Mode Complexity):** Added 4 hours for comprehensive sync UI

---

## Action Items

### For PM (John)
- [ ] Schedule weekly design handoff meetings (Mondays 10am, 30 min)
- [ ] Update Sprint 4 plan in `sprint-plans.md` (defer US-Offline-6)
- [ ] Add R14 (Design-Development Misalignment) to `risk-register.md`
- [ ] Share this addendum with Sally and Developer
- [ ] Create `#rightfit-design` Slack channel

### For UX Expert (Sally)
- [ ] Set up Figma workspace (Week 1)
- [ ] Export design tokens as JSON (by end of Week 2)
- [ ] Design Sprint 2 screens (Week 3-4)
- [ ] Attend weekly design handoff meetings (Mondays)
- [ ] Provide Figma view-only access to Developer

### For Developer
- [ ] Review UX specification (`docs/architecture/front-end-spec.md`)
- [ ] Set up React Native Paper + Material-UI themes (Sprint 1)
- [ ] Attend weekly design handoff meetings (Mondays)
- [ ] Test with VoiceOver/TalkBack during implementation (not after)
- [ ] Flag design blockers in `#rightfit-design` Slack

---

**Last Updated:** 2025-10-27
**Next Review:** Week 1 (after Sprint 1 planning)
**Document Owner:** John (PM)

**Status:** ✅ Ready for Sprint 1 Kickoff
