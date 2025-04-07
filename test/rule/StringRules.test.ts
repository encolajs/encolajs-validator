import { describe, it, expect, beforeEach } from 'vitest'
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
import { PasswordRule } from '../../src/rule/Password'

describe('String Validation Rules', () => {
    describe('AlphaRule', () => {
        it('should validate strings containing only letters', () => {
            const rule = new AlphaRule()
            const dataSource = {}

            expect(rule.validate('abc', 'path', dataSource)).toBe(true)
            expect(rule.validate('ABC', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcDEF', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings containing non-letters', () => {
            const rule = new AlphaRule()
            const dataSource = {}

            expect(rule.validate('abc123', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc def', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc-def', 'path', dataSource)).toBe(false)
        })
    })

    describe('AlphaNumericRule', () => {
        it('should validate strings containing only letters and numbers', () => {
            const rule = new AlphaNumericRule()
            const dataSource = {}

            expect(rule.validate('abc123', 'path', dataSource)).toBe(true)
            expect(rule.validate('ABC123', 'path', dataSource)).toBe(true)
            expect(rule.validate('123abc', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings containing other characters', () => {
            const rule = new AlphaNumericRule()
            const dataSource = {}

            expect(rule.validate('abc def', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc-123', 'path', dataSource)).toBe(false)
            expect(rule.validate('abc_123', 'path', dataSource)).toBe(false)
        })
    })

    describe('ContainsRule', () => {
        it('should validate strings containing substring', () => {
            const rule = new ContainsRule(['test'])
            const dataSource = {}

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('a test case', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not containing substring', () => {
            const rule = new ContainsRule(['test'])
            const dataSource = {}

            expect(rule.validate('tes', 'path', dataSource)).toBe(false)
            expect(rule.validate('est', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for substring', () => {
            const rule = new ContainsRule(['@search.term'])
            const dataSource = {
                search: { term: 'test' }
            }

            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should throw error if substring parameter is missing', () => {
            const rule = new ContainsRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('ContainsRule requires a substring parameter')
        })
    })

    describe('EmailRule', () => {
        it('should validate valid email addresses', () => {
            const rule = new EmailRule()
            const dataSource = {}

            expect(rule.validate('user@example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('first.last@example.co.uk', 'path', dataSource)).toBe(true)
            expect(rule.validate('user+tag@example.com', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid email addresses', () => {
            const rule = new EmailRule()
            const dataSource = {}

            expect(rule.validate('not-an-email', 'path', dataSource)).toBe(false)
            expect(rule.validate('user@', 'path', dataSource)).toBe(false)
            expect(rule.validate('@example.com', 'path', dataSource)).toBe(false)
            expect(rule.validate('user@.com', 'path', dataSource)).toBe(false)
        })
    })

    describe('MatchesRule', () => {
        it('should validate strings matching regex pattern', () => {
            const rule = new MatchesRule(['^[A-Z]\\d{3}$'])
            const dataSource = {}

            expect(rule.validate('A123', 'path', dataSource)).toBe(true)
            expect(rule.validate('B456', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not matching regex pattern', () => {
            const rule = new MatchesRule(['^[A-Z]\\d{3}$'])
            const dataSource = {}

            expect(rule.validate('a123', 'path', dataSource)).toBe(false)
            expect(rule.validate('A12', 'path', dataSource)).toBe(false)
            expect(rule.validate('A1234', 'path', dataSource)).toBe(false)
        })

        it('should throw error if pattern parameter is missing', () => {
            const rule = new MatchesRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MatchesRule requires a regular expression pattern parameter')
        })

        it('should throw error if pattern is invalid', () => {
            const rule = new MatchesRule(['\\'])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('Invalid regular expression pattern')
        })
    })

    describe('MaxLengthRule', () => {
        it('should validate strings not exceeding max length', () => {
            const rule = new MaxLengthRule(['5'])
            const dataSource = {}

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate('a', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcde', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings exceeding max length', () => {
            const rule = new MaxLengthRule(['5'])
            const dataSource = {}

            expect(rule.validate('abcdef', 'path', dataSource)).toBe(false)
            expect(rule.validate('abcdefghi', 'path', dataSource)).toBe(false)
        })

        it('should throw error if max length parameter is missing', () => {
            const rule = new MaxLengthRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MaxLengthRule requires a maximum length parameter')
        })
    })

    describe('MinLengthRule', () => {
        it('should validate strings meeting min length', () => {
            const rule = new MinLengthRule(['3'])
            const dataSource = {}

            expect(rule.validate('abc', 'path', dataSource)).toBe(true)
            expect(rule.validate('abcde', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings below min length', () => {
            const rule = new MinLengthRule(['3'])
            const dataSource = {}

            expect(rule.validate('a', 'path', dataSource)).toBe(false)
            expect(rule.validate('ab', 'path', dataSource)).toBe(false)
        })

        it('should throw error if min length parameter is missing', () => {
            const rule = new MinLengthRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('MinLengthRule requires a minimum length parameter')
        })
    })

    describe('PasswordRule', () => {
        let rule
        let datasource

        beforeEach(() => {
            // Create a new rule instance before each test
            rule = new PasswordRule()
            datasource = {}
        })

        // Test empty values
        it('should return true for empty values', () => {
            expect(rule.validate('', 'password', datasource)).toBe(true)
            expect(rule.validate(null, 'password', datasource)).toBe(true)
            expect(rule.validate(undefined, 'password', datasource)).toBe(true)
        })

        // Test invalid parameters
        it('should throw an error for invalid parameters', () => {
            rule.parameters = [-1, 10]
            expect(() => rule.validate('Password1!', 'password', datasource)).toThrow()

            rule.parameters = [20, 10]
            expect(() => rule.validate('Password1!', 'password', datasource)).toThrow()

            rule.parameters = ['invalid', 'params']
            expect(() => rule.validate('Password1!', 'password', datasource)).toThrow()
        })

        // Test length validation
        it('should validate password length correctly', () => {
            rule.parameters = [8, 32]

            // Too short
            expect(rule.validate('Pass1!', 'password', datasource)).toBe(false)

            // Exact minimum length
            expect(rule.validate('Passw0rd!', 'password', datasource)).toBe(true)

            // Within valid range
            expect(rule.validate('ThisIsAValidP4ssw0rd!', 'password', datasource)).toBe(true)

            // Exact maximum length
            const exactMaxLength = 'A'.repeat(29) + 'B1!'
            expect(exactMaxLength.length).toBe(32)
            expect(rule.validate(exactMaxLength, 'password', datasource)).toBe(true)

            // Too long
            const tooLong = 'A'.repeat(31) + 'B1!'
            expect(tooLong.length).toBe(34)
            expect(rule.validate(tooLong, 'password', datasource)).toBe(false)
        })

        // Test custom length parameters
        it('should respect custom length parameters', () => {
            rule.parameters = [6, 12]

            // Too short for default but valid for custom
            expect(rule.validate('Pass1!', 'password', datasource)).toBe(true)

            // Too long for custom but valid for default
            expect(rule.validate('ThisIsALongerP4ssword!', 'password', datasource)).toBe(false)
        })

        // Test character requirements
        it('should validate character requirements', () => {
            rule.parameters = [8, 32]

            // Missing uppercase
            expect(rule.validate('password1!', 'password', datasource)).toBe(false)

            // Missing number
            expect(rule.validate('Password!', 'password', datasource)).toBe(false)

            // Missing special character
            expect(rule.validate('Password1', 'password', datasource)).toBe(false)

            // All requirements met
            expect(rule.validate('Password1!', 'password', datasource)).toBe(true)
        })

        // Test edge cases with different special characters
        it('should accept different special characters', () => {
            rule.parameters = [8, 32]

            expect(rule.validate('Password1@', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1#', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1$', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1%', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1^', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1&', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1*', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1(', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1)', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1-', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1_', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1=', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1+', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1[', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1]', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1{', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1}', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1;', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1:', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1"', 'password', datasource)).toBe(true)
            expect(rule.validate("Password1'", 'password', datasource)).toBe(true)
            expect(rule.validate('Password1\\', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1|', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1,', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1.', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1<', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1>', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1/', 'password', datasource)).toBe(true)
            expect(rule.validate('Password1?', 'password', datasource)).toBe(true)
        })

        // Test type coercion
        it('should handle type coercion', () => {
            rule.parameters = [8, 32]

            // Number that can be converted to valid string
            const numberValue = 12345678
            expect(rule.validate(numberValue, 'password', datasource)).toBe(false) // No uppercase or special chars

            // Object with toString method
            const objectValue = {
                toString: () => 'Password1!'
            }
            expect(rule.validate(objectValue, 'password', datasource)).toBe(true)
        })

        // Test default parameters
        it('should use default parameters if not provided', () => {
            // Create a new rule without parameters (using default 8, 32)
            const defaultRule = new PasswordRule()
            defaultRule.parameters = undefined

            // Should still work with default parameters
            expect(defaultRule.validate('Short1!', 'password', datasource)).toBe(false) // Too short
            expect(defaultRule.validate('Password1!', 'password', datasource)).toBe(true) // Valid

            const veryLongPassword = 'P' + 'a'.repeat(35) + 'ssword1!'
            expect(veryLongPassword.length).toBe(44)
            expect(defaultRule.validate(veryLongPassword, 'password', datasource)).toBe(false) // Too long
        })
    })

    describe('SameAsRule', () => {
        it('should validate values matching comparison value', () => {
            const rule = new SameAsRule(['test'])
            const dataSource = {}

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            // Should use loose comparison (==)
            expect(rule.validate('test', 'path', dataSource)).toBe(true)
        })

        it('should invalidate values not matching comparison value', () => {
            const rule = new SameAsRule(['test'])
            const dataSource = {}

            expect(rule.validate('different', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for comparison', () => {
            const rule = new SameAsRule(['@password'])
            const dataSource = {
                password: 'secret',
                confirm_password: 'secret'
            }

            expect(rule.validate('secret', 'confirm_password', dataSource)).toBe(true)
            expect(rule.validate('different', 'confirm_password', dataSource)).toBe(false)
        })

        it('should throw error if comparison value parameter is missing', () => {
            const rule = new SameAsRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('SameAsRule requires a comparison value parameter')
        })
    })

    describe('SlugRule', () => {
        it('should validate valid slugs', () => {
            const rule = new SlugRule()
            const dataSource = {}

            expect(rule.validate('valid-slug', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid_slug', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid-slug-123', 'path', dataSource)).toBe(true)
            expect(rule.validate('valid_slug_123', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid slugs', () => {
            const rule = new SlugRule()
            const dataSource = {}

            expect(rule.validate('invalid slug', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid.slug', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid@slug', 'path', dataSource)).toBe(false)
        })
    })

    describe('StartsWithRule', () => {
        it('should validate strings starting with prefix', () => {
            const rule = new StartsWithRule(['test'])
            const dataSource = {}

            expect(rule.validate('test', 'path', dataSource)).toBe(true)
            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('test case', 'path', dataSource)).toBe(true)
        })

        it('should invalidate strings not starting with prefix', () => {
            const rule = new StartsWithRule(['test'])
            const dataSource = {}

            expect(rule.validate('atest', 'path', dataSource)).toBe(false)
            expect(rule.validate('tes', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for prefix', () => {
            const rule = new StartsWithRule(['@prefix'])
            const dataSource = {
                prefix: 'test'
            }

            expect(rule.validate('testing', 'path', dataSource)).toBe(true)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })

        it('should throw error if prefix parameter is missing', () => {
            const rule = new StartsWithRule([])
            const dataSource = {}

            expect(() => rule.validate('test', 'path', dataSource))
                .toThrow('StartsWithRule requires a substring parameter')
        })
    })

    describe('UrlRule', () => {
        it('should validate valid URLs', () => {
            const rule = new UrlRule()
            const dataSource = {}

            expect(rule.validate('http://example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('https://example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('www.example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com/path', 'path', dataSource)).toBe(true)
            expect(rule.validate('example.com/path?query=value', 'path', dataSource)).toBe(true)
        })

        it('should invalidate invalid URLs', () => {
            const rule = new UrlRule()
            const dataSource = {}

            expect(rule.validate('not a url', 'path', dataSource)).toBe(false)
            expect(rule.validate('http://', 'path', dataSource)).toBe(false)
            expect(rule.validate('https://', 'path', dataSource)).toBe(false)
            expect(rule.validate('example', 'path', dataSource)).toBe(false)
        })
    })
})