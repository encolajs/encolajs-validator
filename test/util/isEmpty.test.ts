import { describe, it, expect } from 'vitest'
import { isEmpty } from '../../src/util/isEmpty'

describe('isEmpty utility function', () => {
    it('should consider null and undefined as empty', () => {
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
    })

    it('should consider empty strings as empty', () => {
        expect(isEmpty('')).toBe(true)
        expect(isEmpty('   ')).toBe(true) // Whitespace only
    })

    it('should consider non-empty strings as not empty', () => {
        expect(isEmpty('0')).toBe(false)
        expect(isEmpty('false')).toBe(false)
        expect(isEmpty('null')).toBe(false)
        expect(isEmpty('text')).toBe(false)
    })

    it('should consider empty arrays as empty', () => {
        expect(isEmpty([])).toBe(true)
    })

    it('should consider non-empty arrays as not empty', () => {
        expect(isEmpty([1, 2, 3])).toBe(false)
        expect(isEmpty([0])).toBe(false)
        expect(isEmpty([null])).toBe(false)
        expect(isEmpty([undefined])).toBe(false)
        expect(isEmpty([[]])).toBe(false)
    })

    it('should consider empty objects as empty', () => {
        expect(isEmpty({})).toBe(true)
    })

    it('should consider non-empty objects as not empty', () => {
        expect(isEmpty({ key: 'value' })).toBe(false)
        expect(isEmpty({ key: null })).toBe(false)
        expect(isEmpty({ key: {} })).toBe(false)
    })

    it('should not consider zero as empty', () => {
        expect(isEmpty(0)).toBe(false)
    })

    it('should not consider boolean values as empty', () => {
        expect(isEmpty(false)).toBe(false)
        expect(isEmpty(true)).toBe(false)
    })

    it('should not consider dates as empty', () => {
        expect(isEmpty(new Date())).toBe(false)
    })

    it('should handle special objects correctly', () => {
        // Functions
        expect(isEmpty(function() {})).toBe(false)
        expect(isEmpty(() => {})).toBe(false)

        // Map and Set
        expect(isEmpty(new Map())).toBe(false) // Empty map is not considered empty
        expect(isEmpty(new Map([['key', 'value']]))).toBe(false) // Non-empty map
        expect(isEmpty(new Set())).toBe(false) // Empty set
        expect(isEmpty(new Set([1, 2, 3]))).toBe(false) // Non-empty set
    })
})