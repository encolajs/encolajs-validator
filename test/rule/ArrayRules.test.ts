import { describe, it, expect } from 'vitest'
import { ArrayMinLengthRule } from '../../src/rule/ArrayMinLength'
import { ArrayMaxLengthRule } from '../../src/rule/ArrayMaxLength'

describe('Array Validation Rules', () => {
    describe('ArrayMinLengthRule', () => {
        it('should validate arrays meeting minimum length', () => {
            const rule = new ArrayMinLengthRule(['2'])
            const dataSource = {}

            expect(rule.validate([1, 2], 'path', dataSource)).toBe(true)
            expect(rule.validate([1, 2, 3], 'path', dataSource)).toBe(true)
            expect(rule.validate(['a', 'b', 'c'], 'path', dataSource)).toBe(true)
        })

        it('should invalidate arrays below minimum length', () => {
            const rule = new ArrayMinLengthRule(['2'])
            const dataSource = {}

            expect(rule.validate([], 'path', dataSource)).toBe(false)
            expect(rule.validate([1], 'path', dataSource)).toBe(false)
            expect(rule.validate(['a'], 'path', dataSource)).toBe(false)
        })

        it('should invalidate non-array values', () => {
            const rule = new ArrayMinLengthRule(['2'])
            const dataSource = {}

            expect(rule.validate('not an array', 'path', dataSource)).toBe(false)
            expect(rule.validate(123, 'path', dataSource)).toBe(false)
            expect(rule.validate({}, 'path', dataSource)).toBe(false)
            expect(rule.validate(null, 'path', dataSource)).toBe(true) // Empty values pass
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true) // Empty values pass
        })

        it('should throw error if min length parameter is missing', () => {
            const rule = new ArrayMinLengthRule([])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMinLengthRule requires a minimum length parameter')
        })

        it('should throw error if min length parameter is invalid', () => {
            const rule = new ArrayMinLengthRule(['invalid'])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMinLengthRule minimum length must be a non-negative integer')
        })

        it('should throw error if min length is negative', () => {
            const rule = new ArrayMinLengthRule(['-1'])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMinLengthRule minimum length must be a non-negative integer')
        })
    })

    describe('ArrayMaxLengthRule', () => {
        it('should validate arrays not exceeding maximum length', () => {
            const rule = new ArrayMaxLengthRule(['3'])
            const dataSource = {}

            expect(rule.validate([], 'path', dataSource)).toBe(true)
            expect(rule.validate([1], 'path', dataSource)).toBe(true)
            expect(rule.validate([1, 2], 'path', dataSource)).toBe(true)
            expect(rule.validate([1, 2, 3], 'path', dataSource)).toBe(true)
            expect(rule.validate(['a', 'b', 'c'], 'path', dataSource)).toBe(true)
        })

        it('should invalidate arrays exceeding maximum length', () => {
            const rule = new ArrayMaxLengthRule(['3'])
            const dataSource = {}

            expect(rule.validate([1, 2, 3, 4], 'path', dataSource)).toBe(false)
            expect(rule.validate([1, 2, 3, 4, 5], 'path', dataSource)).toBe(false)
            expect(rule.validate(['a', 'b', 'c', 'd'], 'path', dataSource)).toBe(false)
        })

        it('should invalidate non-array values', () => {
            const rule = new ArrayMaxLengthRule(['3'])
            const dataSource = {}

            expect(rule.validate('not an array', 'path', dataSource)).toBe(false)
            expect(rule.validate(123, 'path', dataSource)).toBe(false)
            expect(rule.validate({}, 'path', dataSource)).toBe(false)
            expect(rule.validate(null, 'path', dataSource)).toBe(true) // Empty values pass
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true) // Empty values pass
        })

        it('should throw error if max length parameter is missing', () => {
            const rule = new ArrayMaxLengthRule([])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMaxLengthRule requires a maximum length parameter')
        })

        it('should throw error if max length parameter is invalid', () => {
            const rule = new ArrayMaxLengthRule(['invalid'])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMaxLengthRule maximum length must be a non-negative integer')
        })

        it('should throw error if max length is negative', () => {
            const rule = new ArrayMaxLengthRule(['-1'])
            const dataSource = {}

            expect(() => rule.validate([], 'path', dataSource))
                .toThrow('ArrayMaxLengthRule maximum length must be a non-negative integer')
        })
    })

    describe('Array rules integration', () => {
        it('should validate array within min and max constraints', () => {
            const minRule = new ArrayMinLengthRule(['2'])
            const maxRule = new ArrayMaxLengthRule(['4'])
            const dataSource = {}

            // Too short
            let array = [1]
            expect(minRule.validate(array, 'path', dataSource)).toBe(false)
            expect(maxRule.validate(array, 'path', dataSource)).toBe(true)

            // Just right - min boundary
            array = [1, 2]
            expect(minRule.validate(array, 'path', dataSource)).toBe(true)
            expect(maxRule.validate(array, 'path', dataSource)).toBe(true)

            // Just right - middle
            array = [1, 2, 3]
            expect(minRule.validate(array, 'path', dataSource)).toBe(true)
            expect(maxRule.validate(array, 'path', dataSource)).toBe(true)

            // Just right - max boundary
            array = [1, 2, 3, 4]
            expect(minRule.validate(array, 'path', dataSource)).toBe(true)
            expect(maxRule.validate(array, 'path', dataSource)).toBe(true)

            // Too long
            array = [1, 2, 3, 4, 5]
            expect(minRule.validate(array, 'path', dataSource)).toBe(true)
            expect(maxRule.validate(array, 'path', dataSource)).toBe(false)
        })
    })
})