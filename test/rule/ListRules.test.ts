import { describe, it, expect, beforeEach } from 'vitest'
import { InListRule } from '../../src/rule/InList'
import { NotInListRule } from '../../src/rule/NotInList'

describe('InListRule', () => {
    let rule
    let datasource

    beforeEach(() => {
        // Create a new rule instance before each test
        rule = new InListRule()
        datasource = {}
    })

    // Test empty values
    it('should return true for empty values', () => {
        rule.parameters = ['red', 'green', 'blue']

        expect(rule.validate('', 'color', datasource)).toBe(true)
        expect(rule.validate(null, 'color', datasource)).toBe(true)
        expect(rule.validate(undefined, 'color', datasource)).toBe(true)
    })

    // Test missing parameters
    it('should throw an error when no parameters are provided', () => {
        rule.parameters = []
        expect(() => rule.validate('red', 'color', datasource)).toThrow()

        rule.parameters = null
        expect(() => rule.validate('red', 'color', datasource)).toThrow()

        rule.parameters = undefined
        expect(() => rule.validate('red', 'color', datasource)).toThrow()
    })

    // Test basic validation with strings
    it('should validate string values correctly', () => {
        rule.parameters = ['red', 'green', 'blue']

        expect(rule.validate('red', 'color', datasource)).toBe(true)
        expect(rule.validate('green', 'color', datasource)).toBe(true)
        expect(rule.validate('blue', 'color', datasource)).toBe(true)
        expect(rule.validate('yellow', 'color', datasource)).toBe(false)
        expect(rule.validate('RED', 'color', datasource)).toBe(false) // Case sensitive
    })

    // Test type coercion
    it('should coerce values to strings for comparison', () => {
        rule.parameters = ['1', '2', '3']

        // Numbers are converted to strings before comparison
        expect(rule.validate(1, 'number', datasource)).toBe(true)
        expect(rule.validate(2, 'number', datasource)).toBe(true)
        expect(rule.validate(3, 'number', datasource)).toBe(true)
        expect(rule.validate(4, 'number', datasource)).toBe(false)

        // Boolean values are converted to strings
        rule.parameters = ['true', 'false']
        expect(rule.validate(true, 'boolean', datasource)).toBe(true)
        expect(rule.validate(false, 'boolean', datasource)).toBe(true)
    })

    // Test with numeric parameters
    it('should work with numeric parameters', () => {
        rule.parameters = [1, 2, 3]

        // String values are compared with numeric parameters
        expect(rule.validate('1', 'number', datasource)).toBe(true)
        expect(rule.validate('2', 'number', datasource)).toBe(true)
        expect(rule.validate('3', 'number', datasource)).toBe(true)
        expect(rule.validate('4', 'number', datasource)).toBe(false)

        // Numeric values are also compared properly
        expect(rule.validate(1, 'number', datasource)).toBe(true)
        expect(rule.validate(2, 'number', datasource)).toBe(true)
        expect(rule.validate(3, 'number', datasource)).toBe(true)
        expect(rule.validate(4, 'number', datasource)).toBe(false)
    })

    // Test with mixed type parameters
    it('should work with mixed type parameters', () => {
        rule.parameters = ['red', 1, true]

        expect(rule.validate('red', 'value', datasource)).toBe(true)
        expect(rule.validate(1, 'value', datasource)).toBe(true)
        expect(rule.validate('1', 'value', datasource)).toBe(true)
        expect(rule.validate(true, 'value', datasource)).toBe(true)
        expect(rule.validate('true', 'value', datasource)).toBe(true)

        expect(rule.validate('blue', 'value', datasource)).toBe(false)
        expect(rule.validate(2, 'value', datasource)).toBe(false)
        expect(rule.validate(false, 'value', datasource)).toBe(false)
    })

    // Test with object values
    it('should handle objects with toString method', () => {
        rule.parameters = ['test', 'object']

        const testObject = {
            toString: () => 'test'
        }

        const otherObject = {
            toString: () => 'other'
        }

        expect(rule.validate(testObject, 'object', datasource)).toBe(true)
        expect(rule.validate(otherObject, 'object', datasource)).toBe(false)
    })

    // Test with special values
    it('should handle special values correctly', () => {
        rule.parameters = ['0', 'NaN', 'Infinity', '-Infinity']

        expect(rule.validate(0, 'special', datasource)).toBe(true)
        expect(rule.validate(NaN, 'special', datasource)).toBe(true)
        expect(rule.validate(Infinity, 'special', datasource)).toBe(true)
        expect(rule.validate(-Infinity, 'special', datasource)).toBe(true)
    })

    // Test with empty string in allowed values
    it('should validate empty string if it is in allowed values', () => {
        rule.parameters = ['', 'other-value']

        expect(rule.validate('', 'value', datasource)).toBe(true)
        expect(rule.validate('other-value', 'value', datasource)).toBe(true)
        expect(rule.validate('not-allowed', 'value', datasource)).toBe(false)
    })

    // Test with large number of options
    it('should work with a large number of options', () => {
        // Create an array with 1000 string values
        const largeOptions = Array.from({ length: 1000 }, (_, i) => `option-${i}`)
        rule.parameters = largeOptions

        expect(rule.validate('option-0', 'value', datasource)).toBe(true)
        expect(rule.validate('option-500', 'value', datasource)).toBe(true)
        expect(rule.validate('option-999', 'value', datasource)).toBe(true)
        expect(rule.validate('option-1000', 'value', datasource)).toBe(false)
        expect(rule.validate('not-in-list', 'value', datasource)).toBe(false)
    })
})


describe('NotInListRule', () => {
    let rule
    let datasource

    beforeEach(() => {
        // Create a new rule instance before each test
        rule = new NotInListRule()
        datasource = {
            blockedColor: 'red',
            blockedId: 5,
            blockedStatus: 'inactive'
        }
    })

    // Test empty values
    it('should return true for empty values', () => {
        rule.parameters = ['red', 'green', 'blue']

        expect(rule.validate('', 'color', datasource)).toBe(true)
        expect(rule.validate(null, 'color', datasource)).toBe(true)
        expect(rule.validate(undefined, 'color', datasource)).toBe(true)
    })

    // Test missing parameters
    it('should throw an error when no parameters are provided', () => {
        rule.parameters = []
        expect(() => rule.validate('red', 'color', datasource)).toThrow()

        rule.parameters = null
        expect(() => rule.validate('red', 'color', datasource)).toThrow()

        rule.parameters = undefined
        expect(() => rule.validate('red', 'color', datasource)).toThrow()
    })

    // Test basic validation with strings
    it('should validate string values correctly', () => {
        rule.parameters = ['red', 'green', 'blue']

        expect(rule.validate('red', 'color', datasource)).toBe(false)
        expect(rule.validate('green', 'color', datasource)).toBe(false)
        expect(rule.validate('blue', 'color', datasource)).toBe(false)
        expect(rule.validate('yellow', 'color', datasource)).toBe(true)
        expect(rule.validate('RED', 'color', datasource)).toBe(true) // Case sensitive
    })

    // Test parameter resolution using references
    it('should resolve parameter references correctly', () => {
        rule.parameters = ['@blockedColor', '@blockedStatus']

        expect(rule.validate('red', 'color', datasource)).toBe(false)
        expect(rule.validate('inactive', 'status', datasource)).toBe(false)
        expect(rule.validate('active', 'status', datasource)).toBe(true)
        expect(rule.validate('yellow', 'color', datasource)).toBe(true)
    })

    // Test with numeric values and parameters
    it('should handle numeric values correctly', () => {
        rule.parameters = [1, 2, 3, '@blockedId']

        expect(rule.validate(1, 'id', datasource)).toBe(false)
        expect(rule.validate(2, 'id', datasource)).toBe(false)
        expect(rule.validate(3, 'id', datasource)).toBe(false)
        expect(rule.validate(5, 'id', datasource)).toBe(false) // From resolved @blockedId
        expect(rule.validate(4, 'id', datasource)).toBe(true)

        // String representations should also be blocked
        expect(rule.validate('1', 'id', datasource)).toBe(false)
        expect(rule.validate('2', 'id', datasource)).toBe(false)
        expect(rule.validate('5', 'id', datasource)).toBe(false)
    })

    // Test type coercion
    it('should coerce values to strings for comparison', () => {
        rule.parameters = ['1', '2', '3']

        // Numbers are converted to strings before comparison
        expect(rule.validate(1, 'number', datasource)).toBe(false)
        expect(rule.validate(2, 'number', datasource)).toBe(false)
        expect(rule.validate(3, 'number', datasource)).toBe(false)
        expect(rule.validate(4, 'number', datasource)).toBe(true)

        // Boolean values are converted to strings
        rule.parameters = ['true', 'false']
        expect(rule.validate(true, 'boolean', datasource)).toBe(false)
        expect(rule.validate(false, 'boolean', datasource)).toBe(false)

        // Other types should be converted too
        const date = new Date(2023, 0, 1);
        const dateString = String(date);
        rule.parameters = [dateString]
        expect(rule.validate(date, 'date', datasource)).toBe(false)
    })

    // Test with mixed parameter types and resolution
    it('should handle mixed parameter types with resolution', () => {
        rule.parameters = ['@blockedColor', 1, true]

        expect(rule.validate('red', 'value', datasource)).toBe(false) // From resolved @blockedColor
        expect(rule.validate(1, 'value', datasource)).toBe(false)
        expect(rule.validate('1', 'value', datasource)).toBe(false)
        expect(rule.validate(true, 'value', datasource)).toBe(false)
        expect(rule.validate('true', 'value', datasource)).toBe(false)

        expect(rule.validate('blue', 'value', datasource)).toBe(true)
        expect(rule.validate(2, 'value', datasource)).toBe(true)
        expect(rule.validate(false, 'value', datasource)).toBe(true)
    })

    // Test with object values
    it('should handle objects with toString method', () => {
        rule.parameters = ['test', 'object']

        const testObject = {
            toString: () => 'test'
        }

        const otherObject = {
            toString: () => 'other'
        }

        expect(rule.validate(testObject, 'object', datasource)).toBe(false)
        expect(rule.validate(otherObject, 'object', datasource)).toBe(true)
    })

    // Test when parameter reference doesn't exist
    it('should handle non-existent parameter references gracefully', () => {
        rule.parameters = ['@nonExistentField', 'explicit']

        // Since the reference doesn't exist, it should be treated as undefined or empty
        // The validation should still work with the explicit value
        expect(rule.validate('explicit', 'value', datasource)).toBe(false)
        expect(rule.validate('something-else', 'value', datasource)).toBe(true)
    })

    // Test with special values
    it('should handle special values correctly', () => {
        rule.parameters = ['0', 'NaN', 'Infinity', '-Infinity']

        expect(rule.validate(0, 'special', datasource)).toBe(false)
        expect(rule.validate(Infinity, 'special', datasource)).toBe(false)
        expect(rule.validate(-Infinity, 'special', datasource)).toBe(false)

        // Other special values should pass
        expect(rule.validate(null, 'special', datasource)).toBe(true) // Empty value
        expect(rule.validate(undefined, 'special', datasource)).toBe(true) // Empty value
    })

    // Test with large number of blocked values
    it('should work with a large number of blocked values', () => {
        // Create an array with 1000 string values
        const largeBlocklist = Array.from({ length: 1000 }, (_, i) => `blocked-${i}`)
        rule.parameters = largeBlocklist

        expect(rule.validate('blocked-0', 'value', datasource)).toBe(false)
        expect(rule.validate('blocked-500', 'value', datasource)).toBe(false)
        expect(rule.validate('blocked-999', 'value', datasource)).toBe(false)
        expect(rule.validate('allowed-value', 'value', datasource)).toBe(true)
    })

    // Test that parameters are not mutated between calls
    it('should not permanently mutate parameters across multiple validations', () => {
        rule.parameters = ['@blockedColor', 'explicit']

        // First validation call resolves @blockedColor to 'red'
        expect(rule.validate('red', 'color', datasource)).toBe(false)

        // Change the blocked color in the datasource
        datasource.blockedColor = 'blue'

        // Second validation call should use the updated reference
        expect(rule.validate('blue', 'color', datasource)).toBe(false)
        expect(rule.validate('red', 'color', datasource)).toBe(true) // Should now be allowed
    })
})