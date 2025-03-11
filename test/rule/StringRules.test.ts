import { describe, it, expect } from 'vitest'
import { AlphaRule } from '../../src/rule/Alpha'
import { AlphaNumericRule } from '../../src/rule/AlphaNumeric'
import { ContainsRule } from '../../src/rule/Contains'
import { EmailRule } from '../../src/rule/Email'
import { MatchesRule } from '../../src/rule/Matches'
import { MaxLengthRule } from '../../src/rule/MaxLength'
import { MinLengthRule } from '../../src/rule/MinLength'
import { SameAsRule } from '../../src/rule/SameAs'
import { SlugRule } from '../../src/rule/Slug'
import { StartsWithRule } from '../../src/rule/StartsWith'
import { UrlRule } from '../../src/rule/Url'
import { createRealDataSource } from '../utils'

describe('String Validation Rules', () => {
    describe('AlphaRule', () => {
        it('should validate strings containing only letters', () => {
            const rule = new AlphaRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('abc', 'path', dataSource)).toBe(true)
            expect(rule.validate('ABC', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcDEF', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings containing non-letters', () => {
            const rule = new AlphaRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('abc123', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc def', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc-def', 'path', dataSource)).toBe(false)
        })
    })

    describe('AlphaNumericRule', () => {
        it('should validate strings containing only letters and numbers', () => {
            const rule = new AlphaNumericRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('abc123', 'path', dataSource)).toBe(true)
            expect(rule.validate('ABC123', 'path', dataSource)).toBe(true)
            expect(rule.validate('123abc', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings containing other characters', () => {
            const rule = new AlphaNumericRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('abc def', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc-123', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc_123', 'path', dataSource)).toBe(false)
        })
    })

    describe('ContainsRule', () => {
        it('should validate strings containing substring', () => {
            const rule = new ContainsRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('a test case', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not containing substring', () => {
            const rule = new ContainsRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('tes', 'path', dataSource)).toBe(false)
            expect(rule.validate('est', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for substring', () => {
            const rule = new ContainsRule(['@search.term'])
            const dataSource = createRealDataSource({
                search: { term: 'test' }
            })

            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should throw error if substring parameter is missing', () => {
            const rule = new ContainsRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('ContainsRule requires a substring parameter')
        })
    })

    describe('EmailRule', () => {
        it('should validate valid email addresses', () => {
            const rule = new EmailRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('user@example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('first.last@example.co.uk', 'path', dataSource)).toBe(true)
            expect(rule.validate('user+tag@example.com', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid email addresses', () => {
            const rule = new EmailRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('not-an-email', 'path', dataSource)).toBe(false)
            expect(rule.validate('user@', 'path', dataSource)).toBe(false)
            expect(rule.validate('@example.com', 'path', dataSource)).toBe(false)
            expect(rule.validate('user@.com', 'path', dataSource)).toBe(false)
        })
    })

    describe('MatchesRule', () => {
        it('should validate strings matching regex pattern', () => {
            const rule = new MatchesRule(['^[A-Z]\\d{3}$'])
            const dataSource = createRealDataSource()

            expect(rule.validate('A123', 'path', dataSource)).toBe(true)
            expect(rule.validate('B456', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not matching regex pattern', () => {
            const rule = new MatchesRule(['^[A-Z]\\d{3}$'])
            const dataSource = createRealDataSource()

            expect(rule.validate('a123', 'path', dataSource)).toBe(false)
            expect(rule.validate('A12', 'path', dataSource)).toBe(false)
            expect(rule.validate('A1234', 'path', dataSource)).toBe(false)
        })

        it('should throw error if pattern parameter is missing', () => {
            const rule = new MatchesRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MatchesRule requires a regular expression pattern parameter')
        })

        it('should throw error if pattern is invalid', () => {
            const rule = new MatchesRule(['\\'])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('Invalid regular expression pattern')
        })
    })

    describe('MaxLengthRule', () => {
        it('should validate strings not exceeding max length', () => {
            const rule = new MaxLengthRule(['5'])
            const dataSource = createRealDataSource()

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate('a', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcde', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings exceeding max length', () => {
            const rule = new MaxLengthRule(['5'])
            const dataSource = createRealDataSource()

            expect(rule.validate('abcdef', 'path', dataSource)).toBe(false)
            expect(rule.validate('abcdefghi', 'path', dataSource)).toBe(false)
        })

        it('should throw error if max length parameter is missing', () => {
            const rule = new MaxLengthRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MaxLengthRule requires a maximum length parameter')
        })
    })

    describe('MinLengthRule', () => {
        it('should validate strings meeting min length', () => {
            const rule = new MinLengthRule(['3'])
            const dataSource = createRealDataSource()

            expect(rule.validate('abc', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcde', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings below min length', () => {
            const rule = new MinLengthRule(['3'])
            const dataSource = createRealDataSource()

            expect(rule.validate('a', 'path', dataSource)).toBe(false)
            expect(rule.validate('ab', 'path', dataSource)).toBe(false)
        })

        it('should throw error if min length parameter is missing', () => {
            const rule = new MinLengthRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MinLengthRule requires a minimum length parameter')
        })
    })

    describe('SameAsRule', () => {
        it('should validate values matching comparison value', () => {
            const rule = new SameAsRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            // Should use loose comparison (==)
            expect(rule.validate('test', 'path', dataSource)).toBe(true)
        })

        it('should invalidate values not matching comparison value', () => {
            const rule = new SameAsRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('different', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for comparison', () => {
            const rule = new SameAsRule(['@password'])
            const dataSource = createRealDataSource({
                password: 'secret',
                confirm_password: 'secret'
            })

            expect(rule.validate('secret', 'confirm_password', dataSource)).toBe(true)
            expect(rule.validate('different', 'confirm_password', dataSource)).toBe(false)
        })

        it('should throw error if comparison value parameter is missing', () => {
            const rule = new SameAsRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('SameAsRule requires a comparison value parameter')
        })
    })

    describe('SlugRule', () => {
        it('should validate valid slugs', () => {
            const rule = new SlugRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('valid-slug', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid_slug', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid-slug-123', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid_slug_123', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid slugs', () => {
            const rule = new SlugRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('invalid slug', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid.slug', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid@slug', 'path', dataSource)).toBe(false)
        })
    })

    describe('StartsWithRule', () => {
        it('should validate strings starting with prefix', () => {
            const rule = new StartsWithRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('test case', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not starting with prefix', () => {
            const rule = new StartsWithRule(['test'])
            const dataSource = createRealDataSource()

            expect(rule.validate('atest', 'path', dataSource)).toBe(false)
            expect(rule.validate('tes', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for prefix', () => {
            const rule = new StartsWithRule(['@prefix'])
            const dataSource = createRealDataSource({
                prefix: 'test'
            })

            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should throw error if prefix parameter is missing', () => {
            const rule = new StartsWithRule([])
            const dataSource = createRealDataSource()

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('StartsWithRule requires a substring parameter')
        })
    })

    describe('UrlRule', () => {
        it('should validate valid URLs', () => {
            const rule = new UrlRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('http://example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('https://example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('www.example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com/path', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com/path?query=value', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid URLs', () => {
            const rule = new UrlRule()
            const dataSource = createRealDataSource()

            expect(rule.validate('not a url', 'path', dataSource)).toBe(false)
            expect(rule.validate('http://', 'path', dataSource)).toBe(false)
            expect(rule.validate('https://', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })
    })
})