/**
 * Form Validation Utilities
 * US-UX-7: Form UX Improvements
 */

export type ValidationRule = {
  validate: (value: any) => boolean
  message: string
}

export type FieldValidation = {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  custom?: ValidationRule[]
}

export function validateField(value: any, rules: FieldValidation): string | null {
  // Required
  if (rules.required) {
    const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
    if (isEmpty) {
      return typeof rules.required === 'string' ? rules.required : 'This field is required'
    }
  }

  // Skip other validations if value is empty
  if (value === undefined || value === null || value === '') {
    return null
  }

  const stringValue = String(value)

  // Min Length
  if (rules.minLength) {
    const min = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value
    const message = typeof rules.minLength === 'number'
      ? `Must be at least ${min} characters`
      : rules.minLength.message

    if (stringValue.length < min) {
      return message
    }
  }

  // Max Length
  if (rules.maxLength) {
    const max = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value
    const message = typeof rules.maxLength === 'number'
      ? `Must be no more than ${max} characters`
      : rules.maxLength.message

    if (stringValue.length > max) {
      return message
    }
  }

  // Pattern
  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value
    const message = rules.pattern instanceof RegExp
      ? 'Invalid format'
      : rules.pattern.message

    if (!pattern.test(stringValue)) {
      return message
    }
  }

  // Min (for numbers)
  if (rules.min !== undefined) {
    const numValue = Number(value)
    const min = typeof rules.min === 'number' ? rules.min : rules.min.value
    const message = typeof rules.min === 'number'
      ? `Must be at least ${min}`
      : rules.min.message

    if (numValue < min) {
      return message
    }
  }

  // Max (for numbers)
  if (rules.max !== undefined) {
    const numValue = Number(value)
    const max = typeof rules.max === 'number' ? rules.max : rules.max.value
    const message = typeof rules.max === 'number'
      ? `Must be no more than ${max}`
      : rules.max.message

    if (numValue > max) {
      return message
    }
  }

  // Custom validations
  if (rules.custom) {
    for (const rule of rules.custom) {
      if (!rule.validate(value)) {
        return rule.message
      }
    }
  }

  return null
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]+$/,
  url: /^https?:\/\/.+/,
  ukPostcode: /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i,
  number: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
}

// Pre-made validation rules
export const commonValidations = {
  email: (message = 'Invalid email address'): FieldValidation => ({
    pattern: { value: validationPatterns.email, message },
  }),

  phone: (message = 'Invalid phone number'): FieldValidation => ({
    pattern: { value: validationPatterns.phone, message },
  }),

  ukPostcode: (message = 'Invalid UK postcode'): FieldValidation => ({
    pattern: { value: validationPatterns.ukPostcode, message },
  }),

  url: (message = 'Invalid URL'): FieldValidation => ({
    pattern: { value: validationPatterns.url, message },
  }),

  minLength: (length: number, message?: string): FieldValidation => ({
    minLength: { value: length, message: message || `Must be at least ${length} characters` },
  }),

  maxLength: (length: number, message?: string): FieldValidation => ({
    maxLength: { value: length, message: message || `Must be no more than ${length} characters` },
  }),

  range: (min: number, max: number): FieldValidation => ({
    min: { value: min, message: `Must be between ${min} and ${max}` },
    max: { value: max, message: `Must be between ${min} and ${max}` },
  }),
}
