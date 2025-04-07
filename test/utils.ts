import { vi } from 'vitest'
import { ValidationRule } from '../src/ValidationRule'

/**
 * Create a mock validation rule for testing
 * @param validateResult The result to return from validate()
 * @returns A mock validation rule
 */
export function createMockRule(validateResult: boolean | Promise<boolean> = true): ValidationRule {
    return {
        parameters: [],
        validate: vi.fn().mockReturnValue(validateResult),
        resolveParameter: vi.fn((param) => param)
    } as unknown as ValidationRule
}