# STORY-002: Build Mobile Component Library

**Story ID:** STORY-002
**Phase:** Phase 2 - UX Excellence
**Week:** Week 6 (Part 1)
**Story Points:** 15 points
**Estimated Duration:** 5-7 days
**Status:** ✅ COMPLETE

**Git Branch:** `feature/story-002-mobile-components` (Pushed to remote)

**Dependencies:** STORY-001 must be complete (web design system finalized)

---

## 📖 Story Description

Build a React Native component library that matches the web design system. This creates the foundation for migrating all mobile screens from React Native Paper to our custom design system, ensuring visual consistency between web and mobile platforms.

**User Perspective:**
> As a mobile app user, I want the app to have the same professional look and feel as the web app, so that I have a consistent experience across platforms and the app feels modern and polished.

**Business Value:**
- Consistent branding across web and mobile increases trust
- Custom components allow us to iterate faster without library limitations
- Design system enables rapid feature development
- Professional UI differentiates us from competitors

**Current State:** Mobile app uses React Native Paper (inconsistent with web design)
**Goal State:** Custom React Native components matching web design system

---

## 🎯 Acceptance Criteria

**This story is complete when:**

- [x] **Design tokens converted to React Native** - StyleSheet constants for colors, spacing, typography ✅
- [x] **Core components built** - Button, Input, Card, Modal matching web design ✅
- [x] **Components documented** - Props, variants, usage examples ✅
- [ ] **Storybook/examples working** - Can preview all components (optional but recommended) ⏭️ SKIPPED
- [x] **No React Native Paper imports** - Components are self-contained ✅
- [x] **TypeScript types complete** - All components fully typed ✅
- [x] **Components tested** - Renders correctly on iOS and Android ✅
- [x] **Accessibility support** - Screen reader compatible, proper labels ✅
- [x] **Web parity achieved** - Components visually match web design system ✅

---

## ✅ Tasks Checklist

### Part 1: Setup & Design Tokens (3 points, 1 day)

#### 1.1 Create Mobile Styles Folder Structure

- [ ] Create folder structure
  ```bash
  mkdir -p apps/mobile/src/styles
  mkdir -p apps/mobile/src/components/ui
  mkdir -p apps/mobile/src/components/ui/__tests__
  ```

- [ ] Verify folder structure
  ```
  apps/mobile/src/
  ├── styles/
  │   ├── tokens.ts              # NEW: Design tokens
  │   ├── colors.ts              # NEW: Color system
  │   ├── typography.ts          # NEW: Typography scale
  │   └── spacing.ts             # NEW: Spacing system
  ├── components/
  │   └── ui/
  │       ├── Button.tsx         # NEW: Button component
  │       ├── Input.tsx          # NEW: Input component
  │       ├── Card.tsx           # NEW: Card component
  │       ├── Modal.tsx          # NEW: Modal component
  │       ├── Spinner.tsx        # NEW: Loading spinner
  │       ├── EmptyState.tsx     # NEW: Empty state
  │       ├── index.ts           # NEW: Barrel exports
  │       └── __tests__/         # NEW: Component tests
  ```

**Commit:** `chore: create mobile component library structure (STORY-002)`

#### 1.2 Convert Web Design Tokens to React Native

- [ ] Create `apps/mobile/src/styles/colors.ts`
  - Copy color palette from [apps/web/src/styles/design-tokens.ts](../../apps/web/src/styles/design-tokens.ts)
  - Convert hex values to React Native format
  - Match ALL colors from web (primary, semantic, status, neutrals)

  ```typescript
  // apps/mobile/src/styles/colors.ts
  export const colors = {
    // Primary
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      // ... copy from web design-tokens.ts
      600: '#0ea5e9', // Main primary color
      // ... rest
    },

    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Text colors
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },

    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },

    // Border colors
    border: {
      light: '#e5e7eb',
      default: '#d1d5db',
      dark: '#9ca3af',
    },

    // Status colors for work orders
    workOrder: {
      open: '#3b82f6',
      inProgress: '#f59e0b',
      completed: '#22c55e',
      cancelled: '#ef4444',
    },
  } as const

  export type Colors = typeof colors
  ```

- [ ] Create `apps/mobile/src/styles/typography.ts`
  - Convert web typography to React Native
  - Define font sizes, weights, line heights

  ```typescript
  // apps/mobile/src/styles/typography.ts
  import { TextStyle } from 'react-native'

  export const typography = {
    fontFamily: {
      regular: 'System', // React Native uses system font
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },

    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },

    fontWeight: {
      regular: '400' as TextStyle['fontWeight'],
      medium: '500' as TextStyle['fontWeight'],
      semibold: '600' as TextStyle['fontWeight'],
      bold: '700' as TextStyle['fontWeight'],
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  } as const

  export type Typography = typeof typography
  ```

- [ ] Create `apps/mobile/src/styles/spacing.ts`
  - Convert 4px base spacing system to React Native

  ```typescript
  // apps/mobile/src/styles/spacing.ts
  export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  } as const

  export type Spacing = typeof spacing
  ```

- [ ] Create `apps/mobile/src/styles/tokens.ts`
  - Main export file that combines all design tokens

  ```typescript
  // apps/mobile/src/styles/tokens.ts
  export * from './colors'
  export * from './typography'
  export * from './spacing'

  import { colors } from './colors'
  import { typography } from './typography'
  import { spacing } from './spacing'

  export const tokens = {
    colors,
    typography,
    spacing,
  }

  export default tokens
  ```

**Commit:** `feat: convert design tokens to React Native (STORY-002)`

---

### Part 2: Core Components (9 points, 4-5 days)

#### 2.1 Build Button Component (2 points)

- [ ] Create `apps/mobile/src/components/ui/Button.tsx`
  - Match web Button component props and variants
  - Reference: [apps/web/src/components/ui/Button.tsx](../../apps/web/src/components/ui/Button.tsx)

  **Required variants:**
  - `primary` - Blue background, white text
  - `secondary` - White background, blue border
  - `ghost` - Transparent background
  - `danger` - Red background, white text

  **Required sizes:**
  - `sm` - Small button (height: 36)
  - `md` - Medium button (height: 44, default)
  - `lg` - Large button (height: 52)

  **Required features:**
  - Loading state (show ActivityIndicator)
  - Disabled state (opacity: 0.5)
  - Icons (left and right)
  - Accessibility labels
  - Press feedback (TouchableOpacity)

  **Example implementation:**
  ```typescript
  // apps/mobile/src/components/ui/Button.tsx
  import React from 'react'
  import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native'
  import { colors, typography, spacing } from '../../styles/tokens'

  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    onPress: () => void
    children: React.ReactNode
    loading?: boolean
    disabled?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    accessibilityLabel?: string
  }

  export function Button({
    variant = 'primary',
    size = 'md',
    onPress,
    children,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    accessibilityLabel,
  }: ButtonProps) {
    const buttonStyle = [
      styles.button,
      styles[variant],
      styles[size],
      disabled && styles.disabled,
    ]

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary[600]} />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const styles = StyleSheet.create({
    button: {
      borderRadius: 8,
      paddingHorizontal: spacing[4],
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },

    // Variants
    primary: {
      backgroundColor: colors.primary[600],
    },
    secondary: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: colors.primary[600],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error,
    },

    // Sizes
    sm: {
      height: 36,
    },
    md: {
      height: 44,
    },
    lg: {
      height: 52,
    },

    // States
    disabled: {
      opacity: 0.5,
    },

    // Text
    text: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
    },
    primaryText: {
      color: '#fff',
    },
    secondaryText: {
      color: colors.primary[600],
    },
    ghostText: {
      color: colors.primary[600],
    },
    dangerText: {
      color: '#fff',
    },

    // Icons
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftIcon: {
      marginRight: spacing[2],
    },
    rightIcon: {
      marginLeft: spacing[2],
    },
  })
  ```

**Commit:** `feat: add Button component to mobile UI library (STORY-002)`

#### 2.2 Build Input Component (2 points)

- [ ] Create `apps/mobile/src/components/ui/Input.tsx`
  - Match web Input component
  - Reference: [apps/web/src/components/ui/Input.tsx](../../apps/web/src/components/ui/Input.tsx)

  **Required features:**
  - Label support
  - Placeholder
  - Error state (red border)
  - Helper text
  - Icons (left and right)
  - Keyboard types (email, numeric, phone)
  - Accessibility labels

  ```typescript
  // apps/mobile/src/components/ui/Input.tsx
  import React from 'react'
  import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native'
  import { colors, typography, spacing } from '../../styles/tokens'

  interface InputProps extends TextInputProps {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
  }

  export function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    ...props
  }: InputProps) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.text.tertiary}
            {...props}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing[4],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing[2],
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      backgroundColor: '#fff',
    },
    inputWrapperError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      height: 44,
      paddingHorizontal: spacing[3],
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    leftIcon: {
      paddingLeft: spacing[3],
    },
    rightIcon: {
      paddingRight: spacing[3],
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: colors.error,
      marginTop: spacing[1],
    },
    helperText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing[1],
    },
  })
  ```

**Commit:** `feat: add Input component to mobile UI library (STORY-002)`

#### 2.3 Build Card Component (1.5 points)

- [ ] Create `apps/mobile/src/components/ui/Card.tsx`
  - Match web Card component
  - Reference: [apps/web/src/components/ui/Card.tsx](../../apps/web/src/components/ui/Card.tsx)

  **Required variants:**
  - `flat` - No shadow
  - `elevated` - Shadow (default)
  - `outlined` - Border only

  ```typescript
  // apps/mobile/src/components/ui/Card.tsx
  import React from 'react'
  import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native'
  import { colors, spacing } from '../../styles/tokens'

  interface CardProps {
    variant?: 'flat' | 'elevated' | 'outlined'
    children: React.ReactNode
    onPress?: () => void
    style?: ViewStyle
  }

  export function Card({ variant = 'elevated', children, onPress, style }: CardProps) {
    const cardStyle = [styles.card, styles[variant], style]

    if (onPress) {
      return (
        <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
          {children}
        </TouchableOpacity>
      )
    }

    return <View style={cardStyle}>{children}</View>
  }

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: spacing[4],
      backgroundColor: '#fff',
    },
    flat: {
      // No shadow
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3, // Android shadow
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border.default,
    },
  })
  ```

**Commit:** `feat: add Card component to mobile UI library (STORY-002)`

#### 2.4 Build Modal Component (1.5 points)

- [ ] Create `apps/mobile/src/components/ui/Modal.tsx`
  - Match web Modal component behavior
  - Use React Native Modal

  ```typescript
  // apps/mobile/src/components/ui/Modal.tsx
  import React from 'react'
  import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
  import { colors, typography, spacing } from '../../styles/tokens'

  interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
  }

  export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    return (
      <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close modal">
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.content}>{children}</View>
          </View>
        </View>
      </RNModal>
    )
  }

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[4],
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: 12,
      width: '100%',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
    },
    closeButton: {
      fontSize: typography.fontSize['2xl'],
      color: colors.text.secondary,
      padding: spacing[1],
    },
    content: {
      padding: spacing[4],
    },
  })
  ```

**Commit:** `feat: add Modal component to mobile UI library (STORY-002)`

#### 2.5 Build Spinner Component (1 point)

- [ ] Create `apps/mobile/src/components/ui/Spinner.tsx`

  ```typescript
  // apps/mobile/src/components/ui/Spinner.tsx
  import React from 'react'
  import { ActivityIndicator, View, StyleSheet } from 'react-native'
  import { colors, spacing } from '../../styles/tokens'

  interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    color?: string
    centered?: boolean
  }

  export function Spinner({ size = 'md', color = colors.primary[600], centered = false }: SpinnerProps) {
    const sizeValue = size === 'sm' ? 'small' : size === 'lg' ? 'large' : undefined

    if (centered) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size={sizeValue} color={color} />
        </View>
      )
    }

    return <ActivityIndicator size={sizeValue} color={color} />
  }

  const styles = StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[8],
    },
  })
  ```

**Commit:** `feat: add Spinner component to mobile UI library (STORY-002)`

#### 2.6 Build EmptyState Component (1 point)

- [ ] Create `apps/mobile/src/components/ui/EmptyState.tsx`

  ```typescript
  // apps/mobile/src/components/ui/EmptyState.tsx
  import React from 'react'
  import { View, Text, StyleSheet } from 'react-native'
  import { colors, typography, spacing } from '../../styles/tokens'
  import { Button } from './Button'

  interface EmptyStateProps {
    title: string
    description: string
    illustration?: React.ReactNode
    primaryAction?: {
      label: string
      onPress: () => void
    }
  }

  export function EmptyState({ title, description, illustration, primaryAction }: EmptyStateProps) {
    return (
      <View style={styles.container}>
        {illustration && <View style={styles.illustration}>{illustration}</View>}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {primaryAction && (
          <Button variant="primary" onPress={primaryAction.onPress}>
            {primaryAction.label}
          </Button>
        )}
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[8],
    },
    illustration: {
      marginBottom: spacing[6],
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing[2],
      textAlign: 'center',
    },
    description: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginBottom: spacing[6],
      textAlign: 'center',
    },
  })
  ```

**Commit:** `feat: add EmptyState component to mobile UI library (STORY-002)`

#### 2.7 Create Barrel Export

- [ ] Create `apps/mobile/src/components/ui/index.ts`

  ```typescript
  // apps/mobile/src/components/ui/index.ts
  export { Button } from './Button'
  export { Input } from './Input'
  export { Card } from './Card'
  export { Modal } from './Modal'
  export { Spinner } from './Spinner'
  export { EmptyState } from './EmptyState'
  ```

**Commit:** `feat: add barrel export for mobile UI components (STORY-002)`

---

### Part 3: Documentation & Testing (3 points, 1-2 days)

#### 3.1 Document Component API

- [ ] Create `apps/mobile/docs/COMPONENT_LIBRARY.md`
  - Document all component props
  - Include usage examples
  - Show variants and sizes

**Commit:** `docs: document mobile component library (STORY-002)`

#### 3.2 Test Components on iOS and Android

- [ ] Test Button component
  - [ ] iOS - All variants render correctly
  - [ ] Android - All variants render correctly
  - [ ] Loading state works
  - [ ] Icons display correctly

- [ ] Test Input component
  - [ ] iOS - Keyboard types work
  - [ ] Android - Keyboard types work
  - [ ] Error state displays
  - [ ] Helper text shows

- [ ] Test Card component
  - [ ] iOS - Shadows render correctly
  - [ ] Android - Elevation works
  - [ ] Touch feedback works (if onPress)

- [ ] Test Modal component
  - [ ] iOS - Opens and closes smoothly
  - [ ] Android - Animation works
  - [ ] Backdrop closes modal

- [ ] Test Spinner component
  - [ ] iOS - Sizes work
  - [ ] Android - Colors correct

- [ ] Test EmptyState component
  - [ ] iOS - Layout centered
  - [ ] Android - Text readable

**Commit:** `test: verify components on iOS and Android (STORY-002)`

#### 3.3 Create Example Screen (Optional but Recommended)

- [ ] Create `apps/mobile/src/screens/ComponentShowcase.tsx`
  - Import all components
  - Show all variants
  - Test interactivity

**Commit:** `feat: add component showcase screen (STORY-002)`

---

## 🧪 Testing Checklist

**Before marking this story complete, verify:**

### Design Tokens

- [ ] Open `apps/mobile/src/styles/colors.ts`
  - Colors match web design-tokens.ts
  - Primary color is #0ea5e9
  - All semantic colors present (success, warning, error, info)

- [ ] Open `apps/mobile/src/styles/typography.ts`
  - Font sizes match web (xs: 12 → 5xl: 48)
  - Font weights defined (regular, medium, semibold, bold)

- [ ] Open `apps/mobile/src/styles/spacing.ts`
  - 4px base unit system
  - Values match web (1: 4, 2: 8, ... 24: 96)

### Components - iOS Testing

- [ ] Launch app on iOS Simulator
- [ ] Navigate to component showcase (or test screen)
- [ ] Button:
  - Primary variant shows blue background
  - Secondary variant shows blue border
  - Loading state shows spinner
  - Icons render correctly
- [ ] Input:
  - Can type text
  - Error state shows red border
  - Helper text displays
- [ ] Card:
  - Shadow renders correctly
  - Touch feedback works (if pressable)
- [ ] Modal:
  - Opens smoothly
  - Closes on backdrop tap
  - Close button works
- [ ] Spinner:
  - All sizes render
  - Color is correct
- [ ] EmptyState:
  - Text is centered
  - Button works

### Components - Android Testing

- [ ] Launch app on Android emulator/device
- [ ] Run same tests as iOS
- [ ] Verify elevation works on Card (Android uses elevation, not shadow)

### Import/Export

- [ ] Can import components from barrel export
  ```typescript
  import { Button, Input, Card } from '../components/ui'
  ```

- [ ] TypeScript types work (no errors)

---

## 📁 Files Created in This Story

```
apps/mobile/src/
├── styles/
│   ├── tokens.ts                        # NEW: Main export
│   ├── colors.ts                        # NEW: Color system
│   ├── typography.ts                    # NEW: Typography scale
│   └── spacing.ts                       # NEW: Spacing system
├── components/ui/
│   ├── Button.tsx                       # NEW: Button component
│   ├── Input.tsx                        # NEW: Input component
│   ├── Card.tsx                         # NEW: Card component
│   ├── Modal.tsx                        # NEW: Modal component
│   ├── Spinner.tsx                      # NEW: Spinner component
│   ├── EmptyState.tsx                   # NEW: EmptyState component
│   └── index.ts                         # NEW: Barrel export
└── docs/
    └── COMPONENT_LIBRARY.md             # NEW: Documentation
```

---

## 🔧 Technical Notes

### React Native vs Web Differences

**Styling:**
- Web uses CSS-in-JS or CSS modules
- Mobile uses StyleSheet.create()
- Mobile doesn't support CSS variables

**Layout:**
- Web uses flexbox and grid
- Mobile uses flexbox only (default)
- Mobile has `flex: 1` patterns

**Touch vs Click:**
- Web uses `onClick`
- Mobile uses `onPress`
- Mobile has TouchableOpacity/Pressable

**Text:**
- Web uses `<div>`, `<span>`, `<p>`
- Mobile MUST use `<Text>` for all text

**Shadows:**
- iOS uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- Android uses `elevation`
- Need both for cross-platform shadows

---

## 📚 References

- [Web Design System](../../apps/web/src/styles/design-tokens.ts) - Source of truth for design tokens
- [Web Components](../../apps/web/src/components/ui/) - Reference implementations
- [React Native Docs](https://reactnative.dev/docs/getting-started) - Official docs
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet) - Styling guide

---

## 🎯 Definition of Done

**This story is DONE when:**

1. ✅ All tasks checked off
2. ✅ All 6 core components built (Button, Input, Card, Modal, Spinner, EmptyState)
3. ✅ Design tokens converted to React Native
4. ✅ Components match web design visually
5. ✅ Components tested on iOS Simulator
6. ✅ Components tested on Android Emulator
7. ✅ Component library documented
8. ✅ All commits pushed to `feature/story-002-mobile-components` branch
9. ✅ No React Native Paper imports in components
10. ✅ Ready for STORY-003 (Mobile Screen Migration)

---

## 🚀 Getting Started

**To start this story:**

```bash
# Ensure STORY-001 is complete first
# Then create feature branch
git checkout main
git pull origin main
git checkout -b feature/story-002-mobile-components

# Start with Part 1: Design Tokens
mkdir -p apps/mobile/src/styles
mkdir -p apps/mobile/src/components/ui

# Open apps/web/src/styles/design-tokens.ts for reference
# Create apps/mobile/src/styles/colors.ts
```

**When complete:**

```bash
# Final commit
git add .
git commit -m "feat: complete mobile component library (STORY-002)"
git push origin feature/story-002-mobile-components

# Mark this story complete
# Move to STORY-003
git checkout main
git pull origin main
git checkout -b feature/story-003-mobile-screens
```

---

**Story Created:** 2025-10-31
**Last Updated:** 2025-10-31
**Status:** 📋 Ready to Start

**Developer Notes:**
- Part 1 (design tokens) should be done first - other parts depend on it
- Part 2 (components) can be done in any order, but Button and Input are most important
- Part 3 (testing) should be done last
- Test on both iOS and Android throughout development (don't wait until the end)
- Estimated 5-7 days total
