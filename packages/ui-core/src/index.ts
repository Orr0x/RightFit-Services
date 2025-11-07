/**
 * @rightfit/ui-core
 * Core UI components for RightFit Services
 *
 * @packageDocumentation
 */

// Import global styles
import './styles/variables.css';

// Button
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

// Card
export { Card, CardHeader, CardSection } from './components/Card';
export type {
  CardProps,
  CardVariant,
  CardPadding,
  CardHeaderProps,
  CardSectionProps,
} from './components/Card';

// Input
export { Input } from './components/Input';
export type { InputProps, InputSize, InputVariant } from './components/Input';

// Spinner
export { Spinner } from './components/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner';

// Badge
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant } from './components/Badge';

// EmptyState
export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

// Textarea
export { Textarea } from './components/Textarea';
export type { TextareaProps, TextareaSize } from './components/Textarea';

// Checkbox
export { Checkbox } from './components/Checkbox';
export type { CheckboxProps, CheckboxSize } from './components/Checkbox';

// Radio
export { Radio } from './components/Radio';
export type { RadioProps, RadioSize } from './components/Radio';

// Select
export { Select } from './components/Select';
export type { SelectProps, SelectOption, SelectSize } from './components/Select';

// Modal
export { Modal } from './components/Modal';
export type { ModalProps, ModalSize } from './components/Modal';

// Toast
export { Toast, ToastContainer } from './components/Toast';
export type { ToastProps, ToastContainerProps, ToastVariant, ToastPosition } from './components/Toast';

// Re-export all components in a namespace for convenience
export * as Components from './components';
