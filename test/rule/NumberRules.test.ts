import { describe, it, expect } from 'vitest'
import { NumberRule } from '../../src/rule/Number'
import { IntegerRule } from '../../src/rule/Integer'
import { GreaterThanRule } from '../../src/rule/GreaterThan'
import { GreaterThanOrEqualRule } from '../../src/rule/GreaterThanOrEqual'
import { LessThanRule } from '../../src/rule/LessThan'
import { LessThanOrEqualRule } from '../../src/rule/LessThanOrEqual'
import { NumberComparisonRule } from '../../src/rule/NumberComparisonRule'
import { createRealDataSource } from '../utils'

describe('Number Validation Rules', () => {
    describe('NumberRule', () => {
        it('should validate numbers', () => {
            const rule = new NumberRule()
            const dataSource = createRealDataSource()

            expect(rule.validate(42, 'path', dataSource)).toBe(true)
            expect(rule.validate(3.14, 'path', dataSource)).toBe(true)
            expect(rule.validate('42', 'path', dataSource)).toBe(true)
            expect(rule.validate('3.14', 'path', dataSource)).toBe(true)
            expect(rule.validate('-10', 'path', dataSource)).toBe(true)
            expect(rule.validate('0', 'path', dataSource)).toBe(true)
        })

        describe('GreaterThanRule', () => {
            it('should validate values greater than comparison value', () => {
                const rule = new GreaterThanRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(11, 'path', dataSource)).toBe(true)
                expect(rule.validate('20', 'path', dataSource)).toBe(true)
            })

            it('should invalidate values not greater than comparison value', () => {
                const rule = new GreaterThanRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(10, 'path', dataSource)).toBe(false)
                expect(rule.validate(9, 'path', dataSource)).toBe(false)
                expect(rule.validate('5', 'path', dataSource)).toBe(false)
            })

            it('should support field reference comparison', () => {
                const rule = new GreaterThanRule(['@min.value'])
                const dataSource = createRealDataSource({
                    min: {value: 10}
                })

                expect(rule.validate(11, 'path', dataSource)).toBe(true)
                expect(rule.validate(9, 'path', dataSource)).toBe(false)
            })
        })

        describe('GreaterThanOrEqualRule', () => {
            it('should validate values greater than or equal to comparison value', () => {
                const rule = new GreaterThanOrEqualRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(11, 'path', dataSource)).toBe(true)
                expect(rule.validate(10, 'path', dataSource)).toBe(true)
                expect(rule.validate('10', 'path', dataSource)).toBe(true)
            })

            it('should invalidate values less than comparison value', () => {
                const rule = new GreaterThanOrEqualRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(9, 'path', dataSource)).toBe(false)
                expect(rule.validate('5', 'path', dataSource)).toBe(false)
            })
        })

        describe('LessThanRule', () => {
            it('should validate values less than comparison value', () => {
                const rule = new LessThanRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(9, 'path', dataSource)).toBe(true)
                expect(rule.validate('5', 'path', dataSource)).toBe(true)
            })

            it('should invalidate values not less than comparison value', () => {
                const rule = new LessThanRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(10, 'path', dataSource)).toBe(false)
                expect(rule.validate(11, 'path', dataSource)).toBe(false)
                expect(rule.validate('20', 'path', dataSource)).toBe(false)
            })
        })

        describe('LessThanOrEqualRule', () => {
            it('should validate values less than or equal to comparison value', () => {
                const rule = new LessThanOrEqualRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(9, 'path', dataSource)).toBe(true)
                expect(rule.validate(10, 'path', dataSource)).toBe(true)
                expect(rule.validate('10', 'path', dataSource)).toBe(true)
            })

            it('should invalidate values greater than comparison value', () => {
                const rule = new LessThanOrEqualRule(['10'])
                const dataSource = createRealDataSource()

                expect(rule.validate(11, 'path', dataSource)).toBe(false)
                expect(rule.validate('20', 'path', dataSource)).toBe(false)
            })
        })

        it('should invalidate non-numbers', () => {
            const rule = new NumberRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('not a number', 'path', dataSource)).toBe(false)
            expect(rule.validate('42a', 'path', dataSource)).toBe(false)
            expect(rule.validate({}, 'path', dataSource)).toBe(false)
            expect(rule.validate([], 'path', dataSource)).toBe(false)
        })

        it('should skip validation for empty values', () => {
            const rule = new NumberRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })
    })

    describe('IntegerRule', () => {
        it('should validate integers', () => {
            const rule = new IntegerRule()
            const dataSource = createRealDataSource()

            expect(rule.validate(42, 'path', dataSource)).toBe(true)
            expect(rule.validate('42', 'path', dataSource)).toBe(true)
            expect(rule.validate('-10', 'path', dataSource)).toBe(true)
            expect(rule.validate('0', 'path', dataSource)).toBe(true)
        })

        it('should invalidate non-integers', () => {
            const rule = new IntegerRule()
            const dataSource = createRealDataSource()

            expect(rule.validate(3.14, 'path', dataSource)).toBe(false)
            expect(rule.validate('3.14', 'path', dataSource)).toBe(false)
            expect(rule.validate('not an integer', 'path', dataSource)).toBe(false)
            expect(rule.validate({}, 'path', dataSource)).toBe(false)
        })

        it('should skip validation for empty values', () => {
            const rule = new IntegerRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })
    })

    describe('NumberComparisonRule', () => {
        // Create a concrete subclass for testing
        class TestComparisonRule extends NumberComparisonRule {
            protected compare(a: number, b: number): boolean {
                return a === b
            }
        }

        it('should throw error if comparison value is missing', () => {
            const rule = new TestComparisonRule()
            const dataSource = createRealDataSource()

            expect(() => rule.validate(42, 'path', dataSource))
                .toThrow('Validator requires a comparison value')
        })

        it('should throw error if comparison value is not a number', () => {
            const rule = new TestComparisonRule(['not-a-number'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate(42, 'path', dataSource))
                .toThrow('Validator requires a valid number for comparison')
        })

        it('should resolve field references in comparison value', () => {
            const rule = new TestComparisonRule(['@other.value'])
            const dataSource = createRealDataSource({
                other: {value: 42}
            })

            // Our test comparison rule checks for equality
            expect(rule.validate(42, 'path', dataSource)).toBe(true)
            expect(rule.validate(100, 'path', dataSource)).toBe(false)
        })

        it('should throw error if referenced field is not a number', () => {
            const rule = new TestComparisonRule(['@other.value'])
            const dataSource = createRealDataSource({
                other: {value: 'not-a-number'}
            })

            expect(() => rule.validate(42, 'path', dataSource))
                .toThrow('Validator requires a valid number for comparison')
        })

        it('should skip validation for empty values', () => {
            const rule = new TestComparisonRule(['42'])
            const dataSource = createRealDataSource()

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })

        it('should validate using compare method', () => {
            const rule = new TestComparisonRule(['42'])
            const dataSource = createRealDataSource()

            // Our test comparison rule checks for equality
            expect(rule.validate(42, 'path', dataSource)).toBe(true)
            expect(rule.validate('42', 'path', dataSource)).toBe(true)
            expect(rule.validate(100, 'path', dataSource)).toBe(false)
        })
    })
})