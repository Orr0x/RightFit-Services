# STORY-001: Complete Week 5 Web UX Polish

**Story ID:** STORY-001
**Phase:** Phase 2 - UX Excellence
**Week:** Week 5
**Story Points:** 14 points
**Estimated Duration:** 5-7 days
**Status:** 🟡 Partially Complete (70%)

**Git Branch:** `feature/story-001-week-5-web-ux`

---

## 📖 Story Description

Complete the remaining Week 5 work for web UX polish. This includes finishing form UX improvements, testing responsive design on actual devices, and conducting a full accessibility audit to achieve WCAG AA compliance.

**User Perspective:**
> As a user of the web application, I want polished forms with helpful validation, a responsive design that works on my mobile browser, and full accessibility support so that I can use the app efficiently on any device and with assistive technology.

**Business Value:**
- Professional, polished user experience increases user trust and satisfaction
- Accessibility compliance reduces legal risk and expands addressable market
- Mobile responsiveness allows users to work from any device without installing the app

**Current State:** 14/28 points complete
**Remaining Work:** 14 points (3 stories)

---

## 🎯 Acceptance Criteria

**This story is complete when:**

- [ ] **Forms have inline validation** - All form fields validate on blur, show helpful error messages
- [ ] **Field hints implemented** - All forms have helper text and examples
- [ ] **Date/time pickers improved** - Better UX than native HTML inputs (optional: use library)
- [ ] **Responsive design tested** - Verified on iPhone Safari, Android Chrome, and tablet devices
- [ ] **Touch targets verified** - All interactive elements meet 44x44px minimum
- [ ] **Hamburger menu added** - Mobile navigation uses hamburger menu on small screens
- [ ] **Accessibility audit complete** - Lighthouse score 90+ achieved
- [ ] **ARIA labels complete** - All icons and interactive elements properly labeled
- [ ] **Keyboard navigation tested** - All features accessible via keyboard only
- [ ] **Alt text verified** - All images have descriptive alt text
- [ ] **All 6 web pages tested** - Properties, WorkOrders, Contractors, Certificates, Financial, Tenants

---

## ✅ Tasks Checklist

### Part 1: Form UX Improvements (5 points, 2 days)

**US-UX-7: Form UX Improvements - Complete remaining 5 points**

#### 1.1 Inline Validation on Blur

- [ ] Update `useForm` hook to validate on blur
  - File: [apps/web/src/hooks/useForm.ts](../../apps/web/src/hooks/useForm.ts)
  - Add `validateOnBlur` option (already exists, enable it)
  - Show error messages below field on blur

- [ ] Add error styling to all form components
  - Files: `apps/web/src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`
  - Add `error` prop to show red border
  - Add `helperText` prop for error/hint messages

- [ ] Test inline validation on all pages
  - [ ] Properties page - property name, address, postcode validation
  - [ ] WorkOrders page - title, property selection validation
  - [ ] Contractors page - name, phone, email validation
  - [ ] Certificates page - date validation (expiry > issue date)
  - [ ] Tenants page - email, phone validation

**Commit:** `feat: add inline form validation on blur (STORY-001)`

#### 1.2 Field Hints and Helper Text

- [x] Add `helperText` prop to Input component
  - File: [apps/web/src/components/ui/Input.tsx](../../apps/web/src/components/ui/Input.tsx)
  - Show helper text below input (gray color)
  - Show error text in red when validation fails

- [x] Add helpful examples to forms (PARTIALLY COMPLETE)
  - [x] Properties: "e.g., SW1A 1AA" for postcode ✅
  - [x] Properties: Helper text for property name ✅
  - [x] Properties: Helper text for access instructions ✅
  - [ ] Contractors: "e.g., 07700 900000" for phone
  - [ ] Certificates: "Certificate number from official document"
  - [ ] WorkOrders, Financial, Tenants pages

- [x] Add character counters to Textarea
  - File: [apps/web/src/components/ui/Textarea.tsx](../../apps/web/src/components/ui/Textarea.tsx)
  - Show "123/500 characters" below textarea ✅
  - Optional: Turn red when approaching limit

**Commit:** `feat: add field hints and helper text to Properties form (STORY-001)` ✅ DONE

#### 1.3 Improve Date/Time Pickers (Optional)

- [ ] Evaluate current native HTML date inputs
  - Test on Chrome, Safari, Firefox
  - Decide if native is acceptable or library needed

- [ ] If library needed, add react-datepicker
  ```bash
  cd apps/web
  npm install react-datepicker
  npm install --save-dev @types/react-datepicker
  ```

- [ ] Create DatePicker component (if library used)
  - File: `apps/web/src/components/ui/DatePicker.tsx`
  - Match design system styling
  - Support date ranges for Certificates

- [ ] Update forms to use new DatePicker
  - [ ] Certificates - issue_date, expiry_date
  - [ ] WorkOrders - due_date
  - [ ] Tenants - move_in_date

**Commit:** `feat: improve date/time picker UX (STORY-001)` (if implemented)

---

### Part 2: Responsive Design Testing (6 points, 2 days)

**US-UX-8: Responsive Design - Complete full testing**

#### 2.1 Mobile Browser Testing

- [ ] Test on iPhone Safari (iOS)
  - [ ] Properties page - add, edit, delete
  - [ ] WorkOrders page - create, update status
  - [ ] Navigation works smoothly
  - [ ] Forms are usable

- [ ] Test on Android Chrome
  - [ ] All pages load correctly
  - [ ] Touch interactions work
  - [ ] No horizontal scrolling

- [ ] Test on tablet (iPad or Android tablet)
  - [ ] Verify tablet breakpoint (768px-1023px)
  - [ ] Grid layouts optimize for tablet
  - [ ] Sidebar behavior appropriate

**Testing checklist per device:**
```
Device: ________________
Screen size: ___________
Browser: _______________

[ ] Properties page loads
[ ] WorkOrders page loads
[ ] Forms are usable
[ ] Buttons are tappable (44px min)
[ ] Text is readable (16px min)
[ ] No horizontal scroll
[ ] Navigation works
[ ] Modals display correctly
```

**Commit:** `test: verify responsive design on mobile browsers (STORY-001)`

#### 2.2 Touch Target Verification

- [ ] Audit all interactive elements
  - Use browser DevTools to measure
  - Ensure minimum 44x44px tap targets

- [ ] Fix undersized touch targets
  - Buttons in table rows
  - Icon buttons
  - Close buttons on modals
  - Dropdown menu items

- [ ] Add touch-friendly spacing
  - Gap between stacked buttons
  - Padding around clickable areas

**Commit:** `fix: ensure 44px minimum touch targets (STORY-001)`

#### 2.3 Hamburger Menu for Mobile

- [ ] Add hamburger menu to AppLayout
  - File: [apps/web/src/components/layout/AppLayout.tsx](../../apps/web/src/components/layout/AppLayout.tsx)
  - Show hamburger icon on mobile (< 768px)
  - Hide sidebar by default on mobile

- [ ] Implement slide-in drawer
  - Sidebar slides in from left on hamburger click
  - Overlay/backdrop darkens background
  - Close on backdrop click or X button

- [ ] Test mobile navigation
  - [ ] Hamburger opens sidebar
  - [ ] Can navigate to all pages
  - [ ] Sidebar closes after navigation
  - [ ] Works on iOS Safari
  - [ ] Works on Android Chrome

**Commit:** `feat: add hamburger menu for mobile navigation (STORY-001)`

---

### Part 3: Accessibility Audit (3 points, 1-2 days)

**US-UX-9: Accessibility Compliance - Achieve WCAG AA**

#### 3.1 Run Lighthouse Audit

- [ ] Install Lighthouse CI (optional)
  ```bash
  cd apps/web
  npm install --save-dev @lhci/cli
  ```

- [ ] Run Lighthouse on all pages
  - [ ] Properties - Accessibility score: _____
  - [ ] WorkOrders - Accessibility score: _____
  - [ ] Contractors - Accessibility score: _____
  - [ ] Certificates - Accessibility score: _____
  - [ ] Financial - Accessibility score: _____
  - [ ] Tenants - Accessibility score: _____

- [ ] Document issues found
  - Save Lighthouse reports to `apps/web/lighthouse-reports/`
  - Create issue list with priorities

**Commit:** `test: run Lighthouse accessibility audit (STORY-001)`

#### 3.2 Fix ARIA Labels

- [ ] Add ARIA labels to all icons
  - Search icon - `aria-label="Search"`
  - Add buttons - `aria-label="Add property"`
  - Edit buttons - `aria-label="Edit property {name}"`
  - Delete buttons - `aria-label="Delete property {name}"`

- [ ] Add ARIA labels to form controls
  - All inputs should have associated labels
  - Use `aria-describedby` for helper text
  - Use `aria-invalid` for validation errors

- [ ] Test with screen reader
  - macOS: Use VoiceOver (Cmd+F5)
  - Windows: Use NVDA (free download)
  - Verify all interactive elements are announced

**Commit:** `fix: add ARIA labels for accessibility (STORY-001)`

#### 3.3 Verify Alt Text on Images

- [ ] Audit all `<img>` tags
  - Find all images in components
  - Add descriptive alt text

- [ ] Property/Work Order photos
  - File: Photo upload components
  - User-uploaded photos need alt text
  - Default: "Property photo" or work order title

- [ ] Empty state illustrations
  - File: [apps/web/src/components/ui/EmptyState.tsx](../../apps/web/src/components/ui/EmptyState.tsx)
  - Add alt text to SVG illustrations
  - Or use `role="img"` with `aria-label`

**Commit:** `fix: add alt text to all images (STORY-001)`

#### 3.4 Test Keyboard Navigation

- [ ] Test tab order on all pages
  - Tab through page with keyboard only
  - Verify logical tab order
  - Fix any tab traps

- [ ] Test form submission with Enter
  - Focus input, press Enter
  - Form should submit (not reload page)

- [ ] Test modal keyboard navigation
  - Open modal, press Escape
  - Modal should close
  - Focus should trap inside modal (Tab/Shift+Tab)

- [ ] Test dropdown keyboard navigation
  - Select components
  - ProfileMenu dropdown
  - Use arrow keys to navigate

**Keyboard navigation checklist:**
```
[ ] Can tab to all interactive elements
[ ] Tab order is logical
[ ] Focus indicators visible (2px outline)
[ ] Can activate buttons with Enter/Space
[ ] Can close modals with Escape
[ ] Can navigate dropdowns with arrow keys
[ ] No tab traps (can tab out of everything)
```

**Commit:** `test: verify keyboard navigation accessibility (STORY-001)`

#### 3.5 Achieve 90+ Lighthouse Score

- [ ] Fix all Lighthouse issues
  - Address all high-priority issues
  - Address medium-priority issues
  - Document any low-priority issues deferred

- [ ] Re-run Lighthouse on all pages
  - [ ] Properties - Score: _____ (target: 90+)
  - [ ] WorkOrders - Score: _____ (target: 90+)
  - [ ] Contractors - Score: _____ (target: 90+)
  - [ ] Certificates - Score: _____ (target: 90+)
  - [ ] Financial - Score: _____ (target: 90+)
  - [ ] Tenants - Score: _____ (target: 90+)

- [ ] Document final scores
  - Create summary report
  - Save to `apps/web/docs/accessibility-audit.md`

**Commit:** `docs: document accessibility audit results (STORY-001)`

---

## 🧪 Testing Checklist

**Before marking this story complete, verify:**

### Form UX Testing

- [ ] Open Properties page, try to submit empty form
  - Error messages show on blur
  - Helper text is visible
  - Can fix errors and submit successfully

- [ ] Open WorkOrders page, create work order
  - Select property from dropdown (keyboard accessible)
  - Date picker works smoothly
  - Form validates before submit

- [ ] Open Contractors page, add contractor
  - Phone validation works (shows error for invalid format)
  - Email validation works
  - SMS opt-out checkbox is keyboard accessible

### Responsive Testing

- [ ] Open app on iPhone Safari
  - Hamburger menu opens/closes
  - All buttons are tappable
  - Forms work smoothly
  - No horizontal scrolling

- [ ] Open app on Android Chrome
  - Same as iPhone testing

- [ ] Open app on iPad/tablet
  - Layout optimizes for tablet size
  - Sidebar stays visible (doesn't hide)

### Accessibility Testing

- [ ] Run Lighthouse on Properties page
  - Accessibility score 90+
  - No critical issues

- [ ] Turn on VoiceOver (Mac) or NVDA (Windows)
  - Navigate Properties page with screen reader
  - All interactive elements announced
  - Can complete full workflow (add property)

- [ ] Unplug mouse, use keyboard only
  - Tab through entire app
  - Can access all features
  - Focus indicators visible

---

## 📁 Files to Modify

### Forms (Part 1)

```
apps/web/src/
├── hooks/
│   └── useForm.ts                       # Enable validateOnBlur
├── components/ui/
│   ├── Input.tsx                        # Add helperText, error props
│   ├── Textarea.tsx                     # Add character counter
│   ├── Select.tsx                       # Add helperText, error props
│   └── DatePicker.tsx                   # NEW: Create if using library
└── pages/
    ├── Properties.tsx                   # Add helper text to forms
    ├── WorkOrders.tsx                   # Add helper text to forms
    ├── Contractors.tsx                  # Add helper text to forms
    ├── Certificates.tsx                 # Add helper text to forms
    └── Tenants.tsx                      # Add helper text to forms
```

### Responsive Design (Part 2)

```
apps/web/src/
├── components/layout/
│   └── AppLayout.tsx                    # Add hamburger menu for mobile
└── styles/
    └── variables.css                    # Verify touch target sizes
```

### Accessibility (Part 3)

```
apps/web/src/
├── components/
│   ├── ui/
│   │   └── EmptyState.tsx               # Add alt text to illustrations
│   └── navigation/
│       ├── Sidebar.tsx                  # Add ARIA labels to nav items
│       └── SearchBar.tsx                # Add ARIA labels to search
└── pages/
    └── *.tsx                            # Add ARIA labels to all buttons
```

---

## 🔧 Technical Implementation Guide

### Inline Validation Example

```typescript
// apps/web/src/hooks/useForm.ts
export function useForm<T>({
  initialValues,
  validations,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,  // Enable this
}: UseFormOptions<T>) {
  // ... existing code

  const handleBlur = (field: keyof T) => {
    setTouched({ ...touched, [field]: true })

    // Validate single field on blur
    if (validateOnBlur && validations[field]) {
      const error = validateField(field, values[field])
      setErrors({ ...errors, [field]: error })
    }
  }

  return {
    // ... existing return
    handleBlur, // Add this to return
  }
}
```

### Input with Helper Text Example

```typescript
// apps/web/src/components/ui/Input.tsx
interface InputProps {
  // ... existing props
  helperText?: string
  error?: string
}

export function Input({ helperText, error, ...props }: InputProps) {
  return (
    <div className="input-wrapper">
      <input
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
      {helperText && !error && (
        <span id={`${props.id}-helper`} className="helper-text">
          {helperText}
        </span>
      )}
      {error && (
        <span id={`${props.id}-error`} className="error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
```

### Hamburger Menu Example

```typescript
// apps/web/src/components/layout/AppLayout.tsx
function AppLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile() // max-width: 767px

  return (
    <div className="app-layout">
      {isMobile && (
        <button
          className="hamburger-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <HamburgerIcon />
        </button>
      )}

      <Sidebar
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <main className="main-content">
        {children}
      </main>

      {isMobile && sidebarOpen && (
        <div
          className="backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
```

---

## 📚 References

- [PHASE_2_SPRINT_PLAN.md](../../Project-Plan/PHASE_2_SPRINT_PLAN.md) - Week 5 details (lines 67-78, 183-265)
- [PHASE_2_COMPLETION_SUMMARY.md](../../Project-Plan/PHASE_2_COMPLETION_SUMMARY.md) - Week 5 status (lines 241-416)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- React Hook Form docs (alternative to custom useForm)
- React DatePicker library (if using third-party)

---

## 🎯 Definition of Done

**This story is DONE when:**

1. ✅ All tasks checked off in this document
2. ✅ All acceptance criteria met
3. ✅ All 6 web pages tested (Properties, WorkOrders, Contractors, Certificates, Financial, Tenants)
4. ✅ Lighthouse accessibility score 90+ on all pages
5. ✅ Responsive design verified on iPhone, Android, and tablet
6. ✅ Keyboard navigation tested and working
7. ✅ All commits pushed to `feature/story-001-week-5-web-ux` branch
8. ✅ This .md file updated with test results and final scores
9. ✅ Ready for next story (STORY-002: Mobile Component Library)

---

## 🚀 Getting Started

**To start this story:**

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/story-001-week-5-web-ux

# Verify branch
git branch
# Should show: * feature/story-001-week-5-web-ux

# Start with Part 1: Form UX Improvements
# Open apps/web/src/hooks/useForm.ts
```

**When complete:**

```bash
# Final commit
git add .
git commit -m "feat: complete Week 5 web UX polish (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# Mark this story as complete
# Update status at top of this file to: ✅ Complete

# Move to next story
git checkout main
git pull origin main
git checkout -b feature/story-002-mobile-components
```

---

**Story Created:** 2025-10-31
**Last Updated:** 2025-10-31
**Status:** 📋 Ready to Start

**Developer Notes:**
- Part 1 can be done first (forms)
- Part 2 requires testing on actual devices (borrow phone/tablet if needed)
- Part 3 requires screen reader testing (VoiceOver on Mac is built-in)
- Estimated 5-7 days total (2 days per part + 1 day buffer)
