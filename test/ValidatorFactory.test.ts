import { describe, it, expect, vi } from 'vitest'
import { ValidatorFactory } from '../src/ValidatorFactory'
import { Validator } from '../src/Validator'
import { createMockDataSource } from './utils'
import { ValidationRule } from '../src/ValidationRule'

describe('ValidatorFactory', () => {
    describe('constructor', () => {
        it('should create factory with default message formatter', () => {
            const factory = new ValidatorFactory()
            expect(factory).toBeInstanceOf(ValidatorFactory)
        })

        it('should create factory with custom message formatter', () => {
            const customFormatter = vi.fn()
            const factory = new ValidatorFactory(customFormatter)
            expect(factory).toBeInstanceOf(ValidatorFactory)
        })
    })

    describe('register', () => {
        it('should register validation rule class', async () => {
            const factory = new ValidatorFactory()

            // Concrete validation rule class for testing
            class TestRule extends ValidationRule {
                validate() {
                    return true
                }
            }

            const result = factory.register('test', TestRule, 'Test message')

            // Should return factory for method chaining
            expect(result).toBe(factory)

            // Verify rule was registered by creating a validator and using it
            const dataSource = createMockDataSource()
            const validator = factory.make({
                'field': 'test'
            })

            expect(await validator.validatePath('field', dataSource)).toBe(true)
        })

        it('should register validation function', async () => {
            const factory = new ValidatorFactory()

            // Validation function
            const testFunc = vi.fn().mockReturnValue(true)

            const result = factory.register('another_test', testFunc, 'Test message')

            // Should return factory for method chaining
            expect(result).toBe(factory)

            // Verify function was registered by creating a validator and using it
            const dataSource = createMockDataSource({
                'field': 'value'
            })
            const validator = factory.make({
                'field': 'another_test'
            })

            let valid = await validator.validatePath('field', dataSource)
            expect(valid).toBe(true)
            expect(testFunc).toHaveBeenCalled()
        })

        it('should throw error for invalid rule', () => {
            const factory = new ValidatorFactory()

            expect(() => factory.register('test', null as any, 'Test message'))
                .toThrow('Rule must be a class constructor or validation function')

            expect(() => factory.register('test', {} as any, 'Test message'))
                .toThrow('Rule must be a class constructor or validation function')

            expect(() => factory.register('test', 'not a function' as any, 'Test message'))
                .toThrow('Rule must be a class constructor or validation function')
        })
    })

    describe('make', () => {
        it('should create validator with rules and data source', () => {
            const factory = new ValidatorFactory()
            const dataSource = createMockDataSource()

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email',
                'age': 'required|number|gt:17'
            })

            expect(validator).toBeInstanceOf(Validator)
        })

        it('should create validator with custom messages', () => {
            const factory = new ValidatorFactory()
            const dataSource = createMockDataSource()
            const customMessages = {
                'name.required': 'Please enter your name',
                'email.email': 'Please enter a valid email address'
            }

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email'
            }, customMessages)

            expect(validator).toBeInstanceOf(Validator)

            // We can't easily test the custom messages directly,
            // but we can verify the validator was created with them
        })

        it('should support array rule format', () => {
            const factory = new ValidatorFactory()
            const dataSource = createMockDataSource()

            const validator = factory.make({
                'items': [
                    // @ts-ignore
                    { name: 'required', params: [] },
                    // @ts-ignore
                    { name: 'array_min', params: ['1'] }
                ]
            })

            expect(validator).toBeInstanceOf(Validator)
        })
    })

    describe('default rules', () => {
        it('should register default validation rules', async () => {
            const factory = new ValidatorFactory()
            const dataSource = createMockDataSource({
                name: 'John',
                email: 'john@example.com',
                age: 30,
                password: 'Password123!',
                website: 'https://example.com',
                items: [1, 2, 3],
                birthdate: '2000-01-01'
            })

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email',
                'age': 'required|number|gt:17',
                'password': 'required|password:8,16',
                'website': 'required|url',
                'items': 'required|array_min:1|array_max:10',
                'birthdate': 'required|date'
            })

            // Verify the validator recognizes all default rules
            expect(await validator.validatePath('name', dataSource)).toBe(true)
            expect(await validator.validatePath('email', dataSource)).toBe(true)
            expect(await validator.validatePath('age', dataSource)).toBe(true)
            expect(await validator.validatePath('password', dataSource)).toBe(true)
            expect(await validator.validatePath('website', dataSource)).toBe(true)
            expect(await validator.validatePath('items', dataSource)).toBe(true)
            expect(await validator.validatePath('birthdate', dataSource)).toBe(true)
        })
    })
})