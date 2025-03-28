import { describe, it, expect } from 'vitest'
import { RequiredWithRule } from '../../src/rule/RequiredWith'
import { RequiredWithoutRule } from '../../src/rule/RequiredWithout'
import { RequiredWhenRule } from '../../src/rule/RequiredWhen'
import { RequiredUnlessRule } from '../../src/rule/RequiredUnless'
import { createMockDataSource, createRealDataSource } from '../utils'

describe('Conditional Required Rules', () => {
    describe('RequiredWithRule', () => {
        it('should require field when the other field has a value', () => {
            const rule = new RequiredWithRule(['@other.field'])
            const dataSource = createRealDataSource({
                other: { field: 'has value' },
                this: { field: '' }
            })

            expect(rule.validate('', 'this.field', dataSource)).toBe(false) // Should be required
            expect(rule.validate('value', 'this.field', dataSource)).toBe(true) // Has value, passes
        })

        it('should not require field when the other field is empty', () => {
            const rule = new RequiredWithRule(['@other.field'])
            const dataSource = createRealDataSource({
                other: { field: '' },
                this: { field: '' }
            })

            expect(rule.validate('', 'this.field', dataSource)).toBe(true) // Not required, passes
        })

        it('should throw error if parameter is not a field reference', () => {
            const rule = new RequiredWithRule(['not_a_reference'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('', 'path', dataSource))
                .toThrow('RequiredWithRule requires a parameter referencing another field path using @')
        })
    })

    describe('RequiredWithoutRule', () => {
        it('should require field when the other field is empty', () => {
            const rule = new RequiredWithoutRule(['@other.field'])
            const dataSource = createRealDataSource({
                other: { field: '' },
                this: { field: '' }
            })

            expect(rule.validate('', 'this.field', dataSource)).toBe(false) // Should be required
            expect(rule.validate('value', 'this.field', dataSource)).toBe(true) // Has value, passes
        })

        it('should not require field when the other field has a value', () => {
            const rule = new RequiredWithoutRule(['@other.field'])
            const dataSource = createRealDataSource({
                other: { field: 'has value' },
                this: { field: '' }
            })

            expect(rule.validate('', 'this.field', dataSource)).toBe(true) // Not required, passes
        })

        it('should throw error if parameter is not a field reference', () => {
            const rule = new RequiredWithoutRule(['not_a_reference'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('', 'path', dataSource))
                .toThrow('RequiredWithoutRule requires a parameter referencing another field path using @')
        })
    })

    describe('RequiredWhenRule', () => {
        it('should require field when the other field equals the expected value', () => {
            const rule = new RequiredWhenRule(['@type', 'business'])
            const dataSource = createRealDataSource({
                type: 'business',
                vat_number: ''
            })

            expect(rule.validate('', 'vat_number', dataSource)).toBe(false) // Should be required
            expect(rule.validate('12345', 'vat_number', dataSource)).toBe(true) // Has value, passes
        })

        it('should not require field when the other field does not equal the expected value', () => {
            const rule = new RequiredWhenRule(['@type', 'business'])
            const dataSource = createRealDataSource({
                type: 'personal',
                vat_number: ''
            })

            expect(rule.validate('', 'vat_number', dataSource)).toBe(true) // Not required, passes
        })

        it('should support loose comparison for expected value', () => {
            const rule = new RequiredWhenRule(['@amount', '100'])
            const dataSource = createRealDataSource({
                amount: 100, // Number, not string
                tax: ''
            })

            expect(rule.validate('', 'tax', dataSource)).toBe(false) // Should be required
        })

        it('should make field required when using deep path', () => {
            const rule = new RequiredWhenRule(['@jobs.*.current', true])
            const dataSource = createMockDataSource({
                jobs: [
                    // not the current job, end_date is required
                    { end_date: null, current: false },
                    // current job, end date is not required
                    { end_date: null, current: true }
                ]
            })

            expect(rule.validate(null, 'jobs.0.end_date', dataSource)).toBe(true)
            expect(rule.validate(null, 'jobs.1.end_date', dataSource)).toBe(false)
        })

        it('should throw error if parameter is not a field reference', () => {
            const rule = new RequiredWhenRule(['not_a_reference', 'value'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('', 'path', dataSource))
                .toThrow('RequiredWhenRule requires a parameter referencing another field path using @')
        })
    })

    describe('RequiredUnlessRule', () => {
        it('should require field when the other field does not equal the expected value', () => {
            const rule = new RequiredUnlessRule(['@type', 'personal'])
            const dataSource = createRealDataSource({
                type: 'business',
                vat_number: ''
            })

            expect(rule.validate('', 'vat_number', dataSource)).toBe(false) // Should be required
            expect(rule.validate('12345', 'vat_number', dataSource)).toBe(true) // Has value, passes
        })

        it('should not require field when the other field equals the expected value', () => {
            const rule = new RequiredUnlessRule(['@type', 'personal'])
            const dataSource = createRealDataSource({
                type: 'personal',
                vat_number: ''
            })

            expect(rule.validate('', 'vat_number', dataSource)).toBe(true) // Not required, passes
        })

        it('should make field required when using deep path', () => {
            const rule = new RequiredUnlessRule(['@jobs.*.current', false])
            const dataSource = createMockDataSource({
                jobs: [
                    // not the current job, end_date is required
                    { end_date: null, current: false },
                    // current job, end date is not required
                    { end_date: null, current: true }
                ]
            })

            expect(rule.validate(null, 'jobs.0.end_date', dataSource)).toBe(true)
            expect(rule.validate(null, 'jobs.1.end_date', dataSource)).toBe(false)
        })

        it('should throw error if parameter is not a field reference', () => {
            const rule = new RequiredUnlessRule(['not_a_reference', 'value'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('', 'path', dataSource))
                .toThrow('RequiredUnlessRule requires a parameter referencing another field path using @')
        })
    })
})