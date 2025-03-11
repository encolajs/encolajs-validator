import { describe, it, expect } from 'vitest'
import { isNumber, isInteger, toNumber } from '../../src/util/isNumber'

describe('Number Utility Functions', () => {
    describe('isNumber', () => {
        it('should identify valid numbers', () => {
            expect(isNumber(0)).toBe(true)
            expect(isNumber(42)).toBe(true)
            expect(isNumber(-42)).toBe(true)
            expect(isNumber(3.14)).toBe(true)
            expect(isNumber(-3.14)).toBe(true)
            expect(isNumber('0')).toBe(true)
            expect(isNumber('42')).toBe(true)
            expect(isNumber('-42')).toBe(true)
            expect(isNumber('3.14')).toBe(true)
            expect(isNumber('-3.14')).toBe(true)
            expect(isNumber('   42   ')).toBe(true) // Trimmed
        })

        it('should reject invalid numbers', () => {
            expect(isNumber('')).toBe(false)
            expect(isNumber('   ')).toBe(false)
            expect(isNumber('not a number')).toBe(false)
            expect(isNumber('42a')).toBe(false)
            expect(isNumber('a42')).toBe(false)
            expect(isNumber('42.a')).toBe(false)
            expect(isNumber({})).toBe(false)
            expect(isNumber([])).toBe(false)
            expect(isNumber(null)).toBe(false)
            expect(isNumber(undefined)).toBe(false)
            expect(isNumber(true)).toBe(false)
            expect(isNumber(false)).toBe(false)
        })

        it('should reject NaN and Infinity', () => {
            expect(isNumber(NaN)).toBe(false)
            expect(isNumber(Infinity)).toBe(false)
            expect(isNumber(-Infinity)).toBe(false)
            expect(isNumber('NaN')).toBe(false)
            expect(isNumber('Infinity')).toBe(false)
            expect(isNumber('-Infinity')).toBe(false)
        })
    })

    describe('isInteger', () => {
        it('should identify valid integers', () => {
            expect(isInteger(0)).toBe(true)
            expect(isInteger(42)).toBe(true)
            expect(isInteger(-42)).toBe(true)
            expect(isInteger('0')).toBe(true)
            expect(isInteger('42')).toBe(true)
            expect(isInteger('-42')).toBe(true)
            expect(isInteger('   42   ')).toBe(true) // Trimmed
        })

        it('should reject non-integers', () => {
            expect(isInteger(3.14)).toBe(false)
            expect(isInteger(-3.14)).toBe(false)
            expect(isInteger('3.14')).toBe(false)
            expect(isInteger('-3.14')).toBe(false)
        })

        it('should reject invalid numbers', () => {
            expect(isInteger('')).toBe(false)
            expect(isInteger('   ')).toBe(false)
            expect(isInteger('not a number')).toBe(false)
            expect(isInteger('42a')).toBe(false)
            expect(isInteger('a42')).toBe(false)
            expect(isInteger({})).toBe(false)
            expect(isInteger([])).toBe(false)
            expect(isInteger(null)).toBe(false)
            expect(isInteger(undefined)).toBe(false)
            expect(isInteger(true)).toBe(false)
            expect(isInteger(false)).toBe(false)
        })

        it('should reject NaN and Infinity', () => {
            expect(isInteger(NaN)).toBe(false)
            expect(isInteger(Infinity)).toBe(false)
            expect(isInteger(-Infinity)).toBe(false)
        })
    })

    describe('toNumber', () => {
        it('should convert values to numbers', () => {
            expect(toNumber(0)).toBe(0)
            expect(toNumber(42)).toBe(42)
            expect(toNumber(-42)).toBe(-42)
            expect(toNumber(3.14)).toBe(3.14)
            expect(toNumber('0')).toBe(0)
            expect(toNumber('42')).toBe(42)
            expect(toNumber('-42')).toBe(-42)
            expect(toNumber('3.14')).toBe(3.14)
            expect(toNumber('   42   ')).toBe(42) // Trimmed
        })

        it('should return NaN for invalid numbers', () => {
            expect(toNumber('')).toBeNaN()
            expect(toNumber('   ')).toBeNaN()
            expect(toNumber('not a number')).toBeNaN()
            expect(toNumber('42a')).toBeNaN()
            expect(toNumber('a42')).toBeNaN()
            expect(toNumber({})).toBeNaN()
            expect(toNumber([])).toBeNaN()
            expect(toNumber(null)).toBeNaN()
            expect(toNumber(undefined)).toBeNaN()
            expect(toNumber(true)).toBeNaN()
            expect(toNumber(false)).toBeNaN()
        })

        it('should handle NaN and Infinity', () => {
            expect(toNumber(NaN)).toBeNaN()
            expect(toNumber(Infinity)).toBeNaN()
            expect(toNumber(-Infinity)).toBeNaN()
            expect(toNumber('NaN')).toBeNaN()
            expect(toNumber('Infinity')).toBeNaN()
            expect(toNumber('-Infinity')).toBeNaN()
        })
    })
})