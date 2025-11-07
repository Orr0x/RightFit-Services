# STORY-005: Dark Mode & Cross-Platform Consistency

**Story ID:** STORY-005
**Phase:** Phase 2 - Week 9
**Story Points:** 28 points
**Duration:** 7-10 days
**Status:** 🟡 Partially Complete (Web: 100%, Mobile: 0%)
**Git Branch:** `feature/story-005-dark-mode` (Pushed to remote)
**Dependencies:** STORY-003 complete, STORY-004 complete (SKIPPED - Dark mode implemented early)

---

## 📖 Description

Implement dark mode for web and mobile. Add keyboard shortcuts to web. Ensure cross-platform feature parity and design consistency.

---

## 🎯 Acceptance Criteria

- [x] Dark mode works on web (all pages) ✅ COMPLETE & TESTED
- [ ] Dark mode works on mobile (all screens) ⏭️ PENDING STORY-003
- [ ] System preference detection (mobile) ⏭️ PENDING STORY-003
- [x] Manual toggle (web platform) ✅ COMPLETE
- [x] Preference persisted (web) ✅ localStorage implemented
- [ ] Keyboard shortcuts on web (6+ shortcuts) ⏭️ DEFERRED
- [ ] Cross-platform parity verified ⏭️ PENDING STORY-003
- [ ] Design consistency audit complete ⏭️ PENDING STORY-003

---

## ✅ Tasks (Condensed)

### Part 1: Dark Mode - Web (8 pts, 3 days) ✅ COMPLETE

- [x] Define dark color palette in variables.css ✅
- [x] Update variables.css with dark mode using `.dark` class ✅
- [x] Create ThemeContext with light/dark toggle ✅
- [x] Create ThemeToggle component (clean icon button) ✅
- [x] Add toggle to AppLayout header ✅
- [x] Test dark mode toggle ✅ USER CONFIRMED: "dark mode test success"
- [x] localStorage persistence implemented ✅

**Files Created:**
- `apps/web/src/contexts/ThemeContext.tsx` ✅
- `apps/web/src/components/ui/ThemeToggle.tsx` ✅
- `apps/web/src/components/ui/ThemeToggle.css` ✅

**Commits:**
- `feat: add dark mode support with ThemeContext and toggle` ✅
- `fix: export ThemeToggle from components/ui` ✅
- `fix: improve ThemeToggle visibility and styling` ✅
- `fix: simplify theme toggle to light/dark only and clean up icon style` ✅

### Part 2: Dark Mode - Mobile (5 pts, 2 days)
- [ ] Add dark colors to `apps/mobile/src/styles/colors.ts`
- [ ] Detect system preference (Appearance API)
- [ ] Add manual toggle in ProfileScreen
- [ ] Update all StyleSheets with dark mode
- [ ] Test all screens in dark mode

**Commit:** `feat: add dark mode to mobile app (STORY-005)`

### Part 3: Keyboard Shortcuts - Web (5 pts, 2 days)
- [ ] Install hotkeys library or create custom hook
- [ ] Implement shortcuts:
  - Cmd/Ctrl+K: Global search
  - Cmd/Ctrl+N: New work order
  - Cmd/Ctrl+P: New property
  - Cmd/Ctrl+/: Help dialog
  - Arrow keys: Navigation
- [ ] Create KeyboardShortcuts help dialog
- [ ] Add to ProfileMenu

**Commit:** `feat: add keyboard shortcuts to web (STORY-005)`

### Part 4: Cross-Platform Parity (5 pts, 2 days)
- [ ] Audit feature list (web vs mobile)
- [ ] Document differences
- [ ] Prioritize missing features
- [ ] Verify data syncs bi-directionally
- [ ] Test workflows on both platforms

**Commit:** `docs: cross-platform feature parity audit (STORY-005)`

### Part 5: Design Consistency Audit (5 pts, 2 days)
- [ ] Compare web and mobile side-by-side
- [ ] Verify colors match
- [ ] Verify typography matches
- [ ] Verify spacing matches
- [ ] Fix inconsistencies
- [ ] Document final state

**Commit:** `fix: design consistency improvements (STORY-005)`

---

## 🧪 Testing

### Dark Mode Testing
- [ ] Web - Toggle works, all pages look good
- [ ] Mobile - System preference detected
- [ ] Mobile - Manual toggle works
- [ ] Contrast ratios meet WCAG AA

### Keyboard Shortcuts Testing
- [ ] All shortcuts work
- [ ] Help dialog shows shortcuts
- [ ] No conflicts with browser shortcuts

### Cross-Platform Testing
- [ ] Same workflows work on web and mobile
- [ ] Data syncs correctly
- [ ] Visual consistency verified

---

## 🎯 Definition of Done

1. ✅ Dark mode complete on web and mobile
2. ✅ Keyboard shortcuts working on web
3. ✅ Cross-platform parity verified
4. ✅ Design consistency audit done
5. ✅ All tested on both platforms
6. ✅ Ready for STORY-006

---

**Story Created:** 2025-10-31
**Status:** 📋 Ready
