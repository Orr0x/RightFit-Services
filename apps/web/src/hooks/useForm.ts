/**
 * Form Hook with Validation
 * US-UX-7: Form UX Improvements
 */

import { useState, useCallback, FormEvent } from 'react'
import { validateField, FieldValidation } from '../utils/validation'

export type FormValues = Record<string, any>
export type FormErrors = Record<string, string | null>
export type FormValidations = Record<string, FieldValidation>

export interface UseFormOptions<T extends FormValues> {
  initialValues: T
  validations?: FormValidations
  onSubmit: (values: T) => void | Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useForm<T extends FormValues>({
  initialValues,
  validations = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(validations).forEach((field) => {
      const error = validateField(values[field], validations[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validations])

  const validateSingleField = useCallback(
    (field: string): string | null => {
      if (!validations[field]) return null

      const error = validateField(values[field], validations[field])
      setErrors((prev) => ({ ...prev, [field]: error }))
      return error
    },
    [values, validations]
  )

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value

      setValues((prev) => ({ ...prev, [field]: value }))

      if (validateOnChange && touched[field]) {
        setTimeout(() => validateSingleField(field), 0)
      }
    },
    [validateOnChange, touched, validateSingleField]
  )

  const handleBlur = useCallback(
    (field: string) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      if (validateOnBlur) {
        validateSingleField(field)
      }
    },
    [validateOnBlur, validateSingleField]
  )

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {}
      Object.keys(validations).forEach((field) => {
        allTouched[field] = true
      })
      setTouched(allTouched)

      // Validate
      const isValid = validateForm()

      if (!isValid) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validations, validateForm, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateForm,
  }
}
