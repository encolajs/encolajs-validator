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