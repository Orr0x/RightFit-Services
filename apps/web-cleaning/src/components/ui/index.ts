/**
 * Component Library Index
 * US-UX-2: Component Library
 *
 * Exports app-specific UI components that are not in shared packages
 * Note: Core components (Button, Card, Input, etc.) are now imported from @rightfit/ui-core
 */

// Components migrated to @rightfit/ui-core:
// - Button, Card, Input, Select, Spinner, Badge, EmptyState
// - Textarea, Checkbox, Radio, Modal

// Toast Notifications (different API from ui-core, keeping local version)
export { ToastProvider, useToast } from './Toast'
export type { Toast, ToastType, ToastPosition } from './Toast'

// App-specific components not in ui-core
export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from './Skeleton'
export type { SkeletonProps, SkeletonTextProps, SkeletonCardProps, SkeletonTableProps, SkeletonVariant } from './Skeleton'

export { ThemeToggle } from './ThemeToggle'

export { Tabs, TabPanel } from './Tabs'
export type { TabsProps, TabPanelProps, Tab } from './Tabs'

export { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
