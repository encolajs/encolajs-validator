import { ValidationRule } from './ValidationRule'

/**
 * Message formatter function type
 */
export type messageFormatter = (
  ruleName: string,
  value: any,
  path: string,
  validationRule: ValidationRule
) => string

/**
 * Custom messages configuration
 */
export interface CustomMessagesConfig {
  /** Custom messages by rule path and name */
  [pathAndRule: string]: string
}

/**
 * Options for creating a validator
 */
export interface ValidatorOptions {
  /** Message formatter function */
  messageFormatter?: messageFormatter
  /** Custom messages */
  customMessages?: CustomMessagesConfig
}

export interface FormStateOptions {
  validateOn?: 'change' | 'blur' | 'submit'
  syncOn?: 'change' | 'blur' | 'submit'
  validateInitialValues?: boolean
}

export interface FieldOptions {
  validateOn?: 'change' | 'blur' | 'submit'
  syncOn?: 'change' | 'blur' | 'submit'
}

export interface FieldState {
  value: any
  isDirty: boolean
  isTouched: boolean
  error: string | null
  errors: string[]
  isValidating: boolean
  isValid: boolean
  isVisited: boolean
  handleChange: (value: any) => void
  handleBlur: () => void
  validate: () => Promise<boolean>
  reset: () => void
  shouldShowError: boolean
}

export interface InternalFieldState {
  value?: any
  dirty?: boolean
  touched?: boolean
  visited?: boolean
  validating?: boolean
  options?: FieldOptions
}
