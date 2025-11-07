# STORY-004: Mobile UX Polish & Animations

**Story ID:** STORY-004
**Phase:** Phase 2 - Week 8
**Story Points:** 28 points (2 points already complete)
**Duration:** 7-10 days
**Status:** 🟡 Partially Started (2/28 points - 7%)
**Git Branch:** `feature/story-004-mobile-polish`
**Dependencies:** STORY-003 complete ✅

---

## 📖 Description

Polish mobile app with smooth animations, haptic feedback, improved offline UX, and photo gallery. Achieve native app feel with 60fps animations.

---

## 🎯 Acceptance Criteria

- [ ] Screen transitions smooth (60fps)
- [ ] Haptic feedback on key interactions
- [ ] Offline indicator prominent
- [ ] Sync status visible
- [ ] Photo gallery with lightbox
- [ ] Pull-to-refresh on all list screens
- [ ] Swipe actions on list items (optional)

---

## ✅ Tasks (Condensed)

### Part 1: Animations (8 pts, 3 days)
- [ ] Add screen transition animations
- [ ] Card expand/collapse animations
- [ ] Modal slide-in/out
- [ ] Button press feedback (scale)
- [ ] Pull-to-refresh animation
- [ ] Target 60fps on all animations

**Commit:** `feat: add smooth animations to mobile app (STORY-004)`

### Part 2: Haptic Feedback (3 pts, 1 day)
- [ ] Install expo-haptics: `npx expo install expo-haptics`
- [ ] Add to button presses (light)
- [ ] Add to success actions (success)
- [ ] Add to error actions (error)
- [ ] Add to delete confirmations (warning)

**Commit:** `feat: add haptic feedback (STORY-004)`

### Part 3: Offline UX (5 pts, 2 days)
- [ ] Create OfflineIndicator component
  - Shows at top when offline
  - Shows sync status
  - Shows queued operations count
- [ ] Add manual sync button
- [ ] Add last synced timestamp
- [ ] Show sync progress

**Commit:** `feat: improve offline UX indicators (STORY-004)`

### Part 4: Photo Gallery (2 pts, 1 day)
- [ ] Install image viewer library
- [ ] Create PhotoGallery component
- [ ] Lightbox with pinch-to-zoom
- [ ] Swipe between photos
- [ ] Delete confirmation

**Commit:** `feat: add photo gallery with lightbox (STORY-004)`

### Part 5: List Improvements (10 pts, 3 days)
- [x] Add pull-to-refresh to all lists ✅ DONE (useFocusEffect on WorkOrdersListScreen)
  - **Commit:** `fix: auto-refresh work order list when returning from create screen`
- [x] Enable auto-rotation for tablets ✅ DONE (AndroidManifest.xml fullSensor)
  - **Commit:** `fix: enable auto-rotation for tablets in AndroidManifest`
- [ ] Add swipe-to-delete actions (optional)
- [ ] Loading skeletons for lists
- [ ] Empty states with illustrations (partially done - EmptyState component exists)
- [ ] Smooth scroll performance

**Already Complete (2 pts):**
- ✅ List auto-refresh behavior
- ✅ Auto-rotation support

**Remaining (8 pts):**
- Swipe actions, loading skeletons, scroll optimization

---

## 🧪 Testing

- [ ] All animations 60fps (use React DevTools Profiler)
- [ ] Haptics work on iOS and Android
- [ ] Offline indicator shows when WiFi off
- [ ] Photo gallery works smoothly
- [ ] Pull-to-refresh on all lists

---

## 🎯 Definition of Done

1. ✅ All animations smooth (60fps)
2. ✅ Haptic feedback on iOS and Android
3. ✅ Offline UX clear and informative
4. ✅ Photo gallery polished
5. ✅ All list screens improved
6. ✅ Tested on iOS and Android
7. ✅ Ready for STORY-005

---

**Story Created:** 2025-10-31
**Status:** 📋 Ready
