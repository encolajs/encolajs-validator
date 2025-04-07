import { describe, it, expect, vi } from 'vitest'
import { ValidationRule } from '../src/ValidationRule'

// Create a concrete implementation of ValidationRule for testing
class TestValidationRule extends ValidationRule {
    validate = vi.fn().mockReturnValue(true)
}

describe('ValidationRule', () => {
    describe('constructor', () => {
        it('should store parameters', () => {
            const rule = new TestValidationRule(['param1', 'param2'])
            expect(rule.parameters).toEqual(['param1', 'param2'])
        })

        it('should handle undefined parameters', () => {
            const rule = new TestValidationRule()
            expect(rule.parameters).toBeUndefined()
        })
    })

    describe('resolveParameter', () => {
        it('should resolve field references', () => {
            const rule = new TestValidationRule()
            const dataSource = { user: { name: 'John' } }

            const result = rule.resolveParameter('@user.name', dataSource)

            expect(result).toBe('John')
        })

        it('should return original parameter if not a reference', () => {
            const rule = new TestValidationRule()
            const dataSource = {}

            expect(rule.resolveParameter('value', dataSource)).toBe('value')
            expect(rule.resolveParameter(123, dataSource)).toBe(123)
            expect(rule.resolveParameter(null, dataSource)).toBe(null)
        })

        it('should return original parameter if datasource is not provided', () => {
            const rule = new TestValidationRule()
            expect(rule.resolveParameter('@user.name')).toBe('@user.name')
        })

        it('should return original parameter for non-string values', () => {
            const rule = new TestValidationRule()
            const dataSource = { }

            expect(rule.resolveParameter(123, dataSource)).toBe(123)
            expect(rule.resolveParameter(true, dataSource)).toBe(true)
            expect(rule.resolveParameter(null, dataSource)).toBe(null)
            expect(rule.resolveParameter(undefined, dataSource)).toBe(undefined)
            expect(rule.resolveParameter({}, dataSource)).toEqual({})
        })
    })
})