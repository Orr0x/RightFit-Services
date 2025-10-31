# STORY-003: Migrate Mobile Screens to New Design System

**Story ID:** STORY-003
**Phase:** Phase 2 - UX Excellence
**Week:** Week 6-7 (Part 2)
**Story Points:** 25 points
**Estimated Duration:** 8-10 days
**Status:** 📋 Ready to Start

**Git Branch:** `feature/story-003-mobile-screens`

**Dependencies:** STORY-002 must be complete (mobile component library exists)

---

## 📖 Story Description

Migrate all 10+ mobile screens from React Native Paper to the new custom design system. Replace hardcoded colors with design tokens. Ensure offline sync continues working.

**Goal:** All mobile screens use custom components, match web design, offline sync intact.

---

## 🎯 Acceptance Criteria

- [ ] All screens use custom components (no React Native Paper)
- [ ] All hardcoded colors replaced with design tokens
- [ ] Offline sync still works (WatermelonDB)
- [ ] Visual parity with web app
- [ ] All screens tested on iOS and Android
- [ ] App startup time <100ms (performance maintained)

---

## ✅ Tasks Checklist

### Part 1: Core Screens (12 points, 4-5 days)

#### 1.1 Migrate PropertiesListScreen (3 points)

- [ ] Replace React Native Paper imports
  ```typescript
  // OLD
  import { Text, Card, Title, Paragraph, FAB, Chip } from 'react-native-paper'

  // NEW
  import { Card, Button, EmptyState, Spinner } from '../../components/ui'
  ```

- [ ] Replace hardcoded colors with tokens
  ```typescript
  // OLD
  backgroundColor: '#f5f5f5'

  // NEW
  import { colors } from '../../styles/tokens'
  backgroundColor: colors.background.secondary
  ```

- [ ] Update component structure
  - Replace Paper Card → Custom Card
  - Replace FAB → Custom Button (floating)
  - Replace Chip → Custom badge component

- [ ] Test offline functionality
  - Create property offline
  - Verify syncs when online
  - No errors in console

**File:** [apps/mobile/src/screens/properties/PropertiesListScreen.tsx](../../apps/mobile/src/screens/properties/PropertiesListScreen.tsx)

**Commit:** `feat: migrate PropertiesListScreen to new design system (STORY-003)`

#### 1.2 Migrate WorkOrdersListScreen (3 points)

- [ ] Same process as PropertiesListScreen
- [ ] Replace all React Native Paper components
- [ ] Use design tokens for status colors
  ```typescript
  // OLD
  const statusColors = { OPEN: '#2196F3', IN_PROGRESS: '#9C27B0', ... }

  // NEW
  import { colors } from '../../styles/tokens'
  const statusColors = { OPEN: colors.workOrder.open, IN_PROGRESS: colors.workOrder.inProgress, ... }
  ```

- [ ] Test offline work order creation

**File:** [apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx](../../apps/mobile/src/screens/workOrders/WorkOrdersListScreen.tsx)

**Commit:** `feat: migrate WorkOrdersListScreen to new design system (STORY-003)`

#### 1.3 Migrate PropertyDetailsScreen (2 points)

- [ ] Replace Paper components
- [ ] Add custom Card components for sections
- [ ] Use Button component for actions

**File:** `apps/mobile/src/screens/properties/PropertyDetailsScreen.tsx`

**Commit:** `feat: migrate PropertyDetailsScreen to new design system (STORY-003)`

#### 1.4 Migrate WorkOrderDetailsScreen (2 points)

- [ ] Same as PropertyDetailsScreen
- [ ] Status badge uses design tokens
- [ ] Photo gallery uses custom components

**File:** `apps/mobile/src/screens/workOrders/WorkOrderDetailsScreen.tsx`

**Commit:** `feat: migrate WorkOrderDetailsScreen to new design system (STORY-003)`

#### 1.5 Migrate Create Screens (2 points)

- [ ] CreatePropertyScreen - Use Input, Button components
- [ ] CreateWorkOrderScreen - Same

**Files:** `CreatePropertyScreen.tsx`, `CreateWorkOrderScreen.tsx`

**Commit:** `feat: migrate create screens to new design system (STORY-003)`

---

### Part 2: Auth & Utility Screens (8 points, 3-4 days)

#### 2.1 Migrate Auth Screens (3 points)

- [ ] LoginScreen - Input, Button components
- [ ] RegisterScreen - Same
- [ ] Remove Paper theming

**Files:** `LoginScreen.tsx`, `RegisterScreen.tsx`

**Commit:** `feat: migrate auth screens to new design system (STORY-003)`

#### 2.2 Migrate ProfileScreen (2 points)

- [ ] Use Card for sections
- [ ] Button for logout
- [ ] Match web profile layout

**File:** `ProfileScreen.tsx`

**Commit:** `feat: migrate ProfileScreen to new design system (STORY-003)`

#### 2.3 Migrate DebugScreen (1 point)

- [ ] Optional - keep simple
- [ ] Use Button for actions

**File:** `DebugScreen.tsx`

**Commit:** `feat: migrate DebugScreen to new design system (STORY-003)`

#### 2.4 Update Navigation Components (2 points)

- [ ] Update tab bar styling
- [ ] Use design tokens for colors
- [ ] Match web navigation colors

**Files:** `MainTabNavigator.tsx`, `RootNavigator.tsx`

**Commit:** `feat: update navigation with design tokens (STORY-003)`

---

### Part 3: Cleanup & Testing (5 points, 1-2 days)

#### 3.1 Remove React Native Paper (2 points)

- [ ] Search codebase for `react-native-paper` imports
  ```bash
  cd apps/mobile
  grep -r "from 'react-native-paper'" src/
  ```

- [ ] Remove all Paper imports
- [ ] Uninstall package
  ```bash
  cd apps/mobile
  npm uninstall react-native-paper
  ```

**Commit:** `chore: remove React Native Paper dependency (STORY-003)`

#### 3.2 Replace All Hardcoded Colors (2 points)

- [ ] Search for hex colors in StyleSheet
  ```bash
  grep -r "#[0-9a-fA-F]\{6\}" apps/mobile/src/
  ```

- [ ] Replace with design tokens
- [ ] Verify no hardcoded colors remain

**Commit:** `refactor: replace hardcoded colors with design tokens (STORY-003)`

#### 3.3 Final Testing (1 point)

- [ ] Test all screens on iOS
- [ ] Test all screens on Android
- [ ] Test offline sync end-to-end
  - Turn off WiFi
  - Create property
  - Create work order
  - Turn on WiFi
  - Verify sync happens
  - Check API server logs

**Commit:** `test: verify all screens on iOS and Android (STORY-003)`

---

## 🧪 Testing Checklist

### iOS Testing
- [ ] PropertiesListScreen - loads, add/edit/delete works
- [ ] WorkOrdersListScreen - loads, create/update works
- [ ] PropertyDetailsScreen - shows details correctly
- [ ] WorkOrderDetailsScreen - shows details correctly
- [ ] CreatePropertyScreen - form works
- [ ] CreateWorkOrderScreen - form works
- [ ] LoginScreen - can login
- [ ] ProfileScreen - displays user info
- [ ] Offline mode - create property offline, syncs online

### Android Testing
- [ ] Same as iOS testing
- [ ] Verify colors match (no platform differences)

### Performance Testing
- [ ] App startup time <100ms
- [ ] No performance regression from Paper → custom components

---

## 📁 Files Modified

```
apps/mobile/src/
├── screens/
│   ├── properties/
│   │   ├── PropertiesListScreen.tsx     # MODIFIED: New components
│   │   ├── PropertyDetailsScreen.tsx    # MODIFIED: New components
│   │   └── CreatePropertyScreen.tsx     # MODIFIED: New components
│   ├── workOrders/
│   │   ├── WorkOrdersListScreen.tsx     # MODIFIED: New components
│   │   ├── WorkOrderDetailsScreen.tsx   # MODIFIED: New components
│   │   └── CreateWorkOrderScreen.tsx    # MODIFIED: New components
│   ├── auth/
│   │   ├── LoginScreen.tsx              # MODIFIED: New components
│   │   └── RegisterScreen.tsx           # MODIFIED: New components
│   ├── profile/
│   │   └── ProfileScreen.tsx            # MODIFIED: New components
│   └── debug/
│       └── DebugScreen.tsx              # MODIFIED: New components
├── navigation/
│   ├── MainTabNavigator.tsx             # MODIFIED: Design tokens
│   └── RootNavigator.tsx                # MODIFIED: Design tokens
└── package.json                         # MODIFIED: Remove react-native-paper
```

---

## 🎯 Definition of Done

1. ✅ All 10+ screens migrated to new design system
2. ✅ React Native Paper uninstalled
3. ✅ All hardcoded colors replaced with tokens
4. ✅ Offline sync verified working
5. ✅ All screens tested on iOS and Android
6. ✅ Visual parity with web app achieved
7. ✅ All commits pushed to `feature/story-003-mobile-screens`
8. ✅ Ready for STORY-004 (Mobile UX Polish)

---

## 🚀 Getting Started

```bash
# Ensure STORY-002 is complete
git checkout main
git pull origin main
git checkout -b feature/story-003-mobile-screens

# Start with PropertiesListScreen
# Open apps/mobile/src/screens/properties/PropertiesListScreen.tsx
```

**When complete:**

```bash
git add .
git commit -m "feat: migrate all mobile screens to new design system (STORY-003)"
git push origin feature/story-003-mobile-screens

# Move to STORY-004
git checkout main
git pull origin main
git checkout -b feature/story-004-mobile-polish
```

---

**Story Created:** 2025-10-31
**Status:** 📋 Ready to Start
**Estimated Duration:** 8-10 days
