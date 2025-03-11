import { Validator } from './Validator'
import { DataSourceInterface } from './datasource/DataSourceInterface'
import { TentativeValuesDataSource } from './datasource/TentativeValuesDataSource'
import {
  FieldOptions,
  FieldState,
  FormStateOptions,
  InternalFieldState,
} from './types'

/**
 * Manages form state, validation, and interaction
 */
export class FormState {
  protected _validator: Validator
  protected _originalDataSource: DataSourceInterface
  protected _tentativeDataSource: TentativeValuesDataSource
  protected _fieldStates: Map<string, InternalFieldState> = new Map()
  protected _submitted: boolean = false
  protected _options: FormStateOptions

  /**
   * Create a new form state manager
   *
   * @param validator - The validator instance
   * @param dataSource - The data source
   * @param options - Form state options
   */
  constructor(
    validator: Validator,
    dataSource: DataSourceInterface,
    options: FormStateOptions = {}
  ) {
    this._validator = validator
    this._originalDataSource = dataSource.clone()
    this._tentativeDataSource = new TentativeValuesDataSource(dataSource, {})
    this._options = {
      validateOn: 'blur',
      syncOn: 'blur',
      ...options,
    }
  }

  /**
   * Register a field with the form
   *
   * @param path - Field path
   * @param options - Field options
   */
  registerField(path: string, options: FieldOptions = {}): void {
    if (!this._fieldStates.has(path)) {
      // Only set the options and states, not the value
      this._fieldStates.set(path, {
        dirty: false,
        touched: false,
        visited: false,
        validating: false,
        options,
      })
    } else {
      // Update options if the field is already registered
      const currentState = this._fieldStates.get(path)!
      this._fieldStates.set(path, {
        ...currentState,
        options: { ...currentState.options, ...options },
      })
    }
  }

  /**
   * Unregister a field from the form
   *
   * @param path - Field path
   */
  unregisterField(path: string): void {
    this._fieldStates.delete(path)
  }

  /**
   * Get the complete state for a field
   *
   * @param path - Field path
   * @returns Field state
   */
  getFieldState(path: string): FieldState {
    if (!this._fieldStates.has(path)) {
      this.registerField(path)
    }

    return {
      value: this.getValue(path),
      isDirty: this.isDirty(path),
      isTouched: this.isTouched(path),
      error: this.getErrors(path)[0] || null,
      errors: this.getErrors(path),
      isValidating: this.isValidating(path),
      isValid: this.isValid(path),
      isVisited: this.isVisited(path),
      handleChange: (value: any) => this.handleChange(path, value),
      handleBlur: () => this.handleBlur(path),
      validate: () => this.validateField(path),
      reset: () => this.resetField(path),
      shouldShowError: this.shouldShowError(path),
    }
  }

  /**
   * Handle field value change
   *
   * @param path - Field path
   * @param value - New value
   */
  handleChange(path: string, value: any): void {
    // Ensure the field is registered
    if (!this._fieldStates.has(path)) {
      this.registerField(path)
    }

    const currentState = this._fieldStates.get(path)!

    // Mark as dirty
    this._fieldStates.set(path, {
      ...currentState,
      dirty: true,
    })

    // Update tentative value in the data source
    this._tentativeDataSource.setValue(path, value)

    const fieldOptions = currentState.options || {}
    const validateOn = fieldOptions.validateOn || this._options.validateOn
    const syncOn = fieldOptions.syncOn || this._options.syncOn

    if (validateOn === 'change') {
      this.validateField(path)
    }

    if (syncOn === 'change') {
      this._commitTentativeValue(path)
    }
  }

  /**
   * Handle field blur event
   *
   * @param path - Field path
   */
  handleBlur(path: string): void {
    // Ensure the field is registered
    if (!this._fieldStates.has(path)) {
      this.registerField(path)
    }

    const currentState = this._fieldStates.get(path)!

    // Mark field as touched and visited
    this._fieldStates.set(path, {
      ...currentState,
      touched: true,
      visited: true,
    })

    const fieldOptions = currentState.options || {}
    const validateOn = fieldOptions.validateOn || this._options.validateOn
    const syncOn = fieldOptions.syncOn || this._options.syncOn

    if (validateOn === 'blur') {
      this.validateField(path)
    }

    if (syncOn === 'blur') {
      this._commitTentativeValue(path)
    }
  }

  /**
   * Get the current value for a field
   *
   * @param path - Field path
   * @returns Field value
   */
  getValue(path: string): any {
    // Get from the tentative data source, which will handle returning
    // either the tentative value or the original value
    return this._tentativeDataSource.getValue(path)
  }

  /**
   * Get all form values
   *
   * @returns Current form values
   */
  getValues(): any {
    return this._tentativeDataSource.getRawData()
  }

  /**
   * Commit a tentative value to the data source
   *
   * @param path - Field path
   */
  protected _commitTentativeValue(path: string): void {
    if (this._tentativeDataSource.hasTentativeValue(path)) {
      // Commit the value to the data source
      this._tentativeDataSource.commit(path)

      // Update field state
      if (this._fieldStates.has(path)) {
        const state = this._fieldStates.get(path)!
        this._fieldStates.set(path, {
          ...state,
          dirty: false,
        })
      }
    }
  }

  /**
   * Commit all tentative values to the data source
   */
  protected _commitAllTentativeValues(): void {
    this._tentativeDataSource.commitAll()

    // Reset dirty state for all fields
    for (const [path, state] of this._fieldStates.entries()) {
      if (state.dirty) {
        this._fieldStates.set(path, {
          ...state,
          dirty: false,
        })
      }
    }
  }

  /**
   * Check if a field has been changed
   *
   * @param path - Field path
   * @returns Whether the field is dirty
   */
  isDirty(path: string): boolean {
    return this._fieldStates.has(path) && !!this._fieldStates.get(path)!.dirty
  }

  /**
   * Check if any field has been changed
   *
   * @returns Whether any field is dirty
   */
  isAnyDirty(): boolean {
    for (const [_, state] of this._fieldStates.entries()) {
      if (state.dirty) return true
    }
    return false
  }

  /**
   * Check if a field has been touched
   *
   * @param path - Field path
   * @returns Whether the field is touched
   */
  isTouched(path: string): boolean {
    return this._fieldStates.has(path) && !!this._fieldStates.get(path)!.touched
  }

  /**
   * Check if a field has been visited
   *
   * @param path - Field path
   * @returns Whether the field is visited
   */
  isVisited(path: string): boolean {
    return this._fieldStates.has(path) && !!this._fieldStates.get(path)!.visited
  }

  /**
   * Check if a field is currently being validated
   *
   * @param path - Field path
   * @returns Whether the field is validating
   */
  isValidating(path: string): boolean {
    return (
      this._fieldStates.has(path) && !!this._fieldStates.get(path)!.validating
    )
  }

  /**
   * Check if any field is currently being validated
   *
   * @returns Whether any field is validating
   */
  isAnyValidating(): boolean {
    for (const [_, state] of this._fieldStates.entries()) {
      if (state.validating) return true
    }
    return false
  }

  /**
   * Get validation errors for a field
   *
   * @param path - Field path
   * @returns Array of error messages
   */
  getErrors(path: string): string[] {
    return this._validator.getErrorsForPath(path)
  }

  /**
   * Get all validation errors
   *
   * @returns Object mapping paths to error messages
   */
  getAllErrors(): Record<string, string[]> {
    return this._validator.getErrors()
  }

  /**
   * Check if a field is valid
   *
   * @param path - Field path
   * @returns Whether the field is valid
   */
  isValid(path: string): boolean {
    return this.getErrors(path).length === 0
  }

  /**
   * Check if the entire form is valid
   *
   * @returns Whether the form is valid
   */
  isFormValid(): boolean {
    return Object.keys(this.getAllErrors()).length === 0
  }

  /**
   * Check if errors should be shown for a field
   *
   * @param path - Field path
   * @returns Whether errors should be shown
   */
  shouldShowError(path: string): boolean {
    return (this.isTouched(path) && this.isDirty(path)) || this._submitted
  }

  /**
   * Validate a specific field
   *
   * @param path - Field path
   * @returns Whether validation passed
   */
  async validateField(path: string): Promise<boolean> {
    // Ensure field is registered
    if (!this._fieldStates.has(path)) {
      this.registerField(path)
    }

    // Mark field as validating
    const currentState = this._fieldStates.get(path)!
    this._fieldStates.set(path, {
      ...currentState,
      validating: true,
    })

    try {
      // Use the validator to validate the field
      const isValid = await this._validator.validatePath(
        path,
        this._tentativeDataSource
      )

      // Validate dependent fields if the validator supports it
      if (typeof this._validator.getDependentFields === 'function') {
        const dependentFields = this._validator.getDependentFields(path)
        for (const dependentPath of dependentFields) {
          await this.validateField(dependentPath)
        }
      }

      return isValid
    } finally {
      // Clear validating flag
      const updatedState = this._fieldStates.get(path)!
      this._fieldStates.set(path, {
        ...updatedState,
        validating: false,
      })
    }
  }

  /**
   * Validate all fields
   *
   * @returns Whether all validations passed
   */
  async validateAll(): Promise<boolean> {
    return await this._validator.validate(this._tentativeDataSource)
  }

  /**
   * Reset a field to its initial state
   *
   * @param path - Field path
   */
  resetField(path: string): void {
    // Remove tentative value if exists
    if (this._tentativeDataSource.hasTentativeValue(path)) {
      this._tentativeDataSource.removePath(path)
    }

    // Reset field state to include only options
    if (this._fieldStates.has(path)) {
      const options = this._fieldStates.get(path)!.options
      this._fieldStates.set(path, {
        dirty: false,
        touched: false,
        visited: false,
        validating: false,
        options,
      })
    }

    // Clear validation errors
    if (typeof this._validator.clearErrorsForPath === 'function') {
      this._validator.clearErrorsForPath(path)
    }
  }

  reset(): void {
    this._tentativeDataSource = new TentativeValuesDataSource(
      this._originalDataSource.clone(),
      {}
    )

    const newFieldStates = new Map<string, InternalFieldState>()
    for (const [path, state] of this._fieldStates.entries()) {
      newFieldStates.set(path, {
        dirty: false,
        touched: false,
        visited: false,
        validating: false,
        options: state.options,
      })
    }
    this._fieldStates = newFieldStates

    this._submitted = false

    // Clear all validation errors
    this._validator.reset()
  }

  /**
   * Submit the form
   *
   * @param handler - Optional submission handler
   * @returns Whether submission was successful
   */
  async submit(handler?: (data: any) => Promise<any>): Promise<boolean> {
    this._submitted = true

    // Mark all registered fields as touched
    for (const [path, state] of this._fieldStates.entries()) {
      this._fieldStates.set(path, {
        ...state,
        touched: true,
      })
    }

    const isValid = await this._validator.validate(this._tentativeDataSource)

    if (isValid) {
      this._commitAllTentativeValues()

      if (handler) {
        try {
          await handler(this._originalDataSource.getRawData())
          return true
        } catch (error: any) {
          if (error.validationErrors) {
            this._validator.setServerErrors(error.validationErrors)
          }
          return false
        }
      }

      return true
    }

    return false
  }
}
