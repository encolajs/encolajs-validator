import { describe, it, expect } from 'vitest'
import { RequiredRule } from '../../src/rule/Required'
import { createMockDataSource } from '../utils'
import { RequiredWhenRule } from '../../src/rule/RequiredWhen'
import { RequiredUnlessRule } from '../../src/rule/RequiredUnless'
import { RequiredWithRule } from '../../src/rule/RequiredWith'
import { RequiredWithoutRule } from '../../src/rule/RequiredWithout'

describe('RequiredRule', () => {
    it('should validate non-empty values', () => {
        const rule = new RequiredRule()
        const dataSource = createMockDataSource()

        expect(rule.validate('value', 'path', dataSource)).toBe(true)
        expect(rule.validate(0, 'path', dataSource)).toBe(true)
        expect(rule.validate(false, 'path', dataSource)).toBe(true)
        expect(rule.validate({}, 'path', dataSource)).toBe(false)
        expect(rule.validate([], 'path', dataSource)).toBe(false)
    })

    it('should not validate empty values', () => {
        const rule = new RequiredRule()
        const dataSource = createMockDataSource()

        expect(rule.validate('', 'path', dataSource)).toBe(false)
        expect(rule.validate(null, 'path', dataSource)).toBe(false)
        expect(rule.validate(undefined, 'path', dataSource)).toBe(false)
    })
})

describe('RequiredWhen', () => {
    it('should make field required when the other field has the expected value', () => {
        const rule = new RequiredWhenRule(['@other_field', 'other_value'])
        const dataSource = createMockDataSource({
            'other_field': 'other_value'
        })

        // field cannot be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(false)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
    it('should not make field required when the other field does not have the expected value', () => {
        const rule = new RequiredWhenRule(['@other_field', 'other_value'])
        const dataSource = createMockDataSource({
            'other_field': 'wrong value'
        })

        // field can be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(true)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
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
})
describe('RequiredUnless', () => {
    it('should make field required when the other field has the unaccepted value', () => {
        const rule = new RequiredUnlessRule(['@other_field', 'other_value'])
        const dataSource = createMockDataSource({
            'other_field': 'different_value'
        })

        // field cannot be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(false)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
    it('should not make field required when the other field does not have the unaccepted value', () => {
        const rule = new RequiredUnlessRule(['@other_field', 'other_value'])
        const dataSource = createMockDataSource({
            'other_field': 'other_value'
        })

        // field can be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(true)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
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
})

describe('RequiredWith', () => {
    it('should make field required when the other field is present', () => {
        const rule = new RequiredWithRule(['@other_field'])
        const dataSource = createMockDataSource({
            'other_field': 'different_value'
        })

        // field cannot be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(false)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
    it('should not make field required when the other field is not present', () => {
        const rule = new RequiredWithRule(['@other_field'])
        const dataSource = createMockDataSource({
        })

        // field can be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(true)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
})
describe('RequiredWithout', () => {
    it('should make field required when the other field is not present', () => {
        const rule = new RequiredWithoutRule(['@other_field'])
        const dataSource = createMockDataSource({
        })

        // field can be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(false)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
    it('should not make field required when the other field is present', () => {
        const rule = new RequiredWithoutRule(['@other_field'])
        const dataSource = createMockDataSource({
            'other_field': 'different_value'
        })

        // field cannot be empty
        expect(rule.validate(null, 'field', dataSource)).toBe(true)
        expect(rule.validate('value', 'field', dataSource)).toBe(true)
    })
})