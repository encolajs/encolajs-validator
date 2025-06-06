import { describe, it, expect, vi } from 'vitest'
import { ValidatorFactory } from '../src/ValidatorFactory'
import { Validator } from '../src/Validator'
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
            // @ts-expect-error testing internals
            expect(factory._defaultMessageFormatter).toBe(customFormatter)
            // @ts-expect-error testing internals
            expect(factory.make({})._messageFormatter).toBe(customFormatter)
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
            const dataSource = {}
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
            const dataSource = {
                'field': 'value'
            }
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
            const dataSource = {}

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email',
                'age': 'required|number|gt:17'
            })

            expect(validator).toBeInstanceOf(Validator)
        })

        it('should create validator with custom messages', () => {
            const factory = new ValidatorFactory()
            const dataSource = {}
            const customMessages = {
                'name.required': 'Please enter your name',
                'email.email': 'Please enter a valid email address'
            }

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email'
            }, customMessages)

            expect(validator).toBeInstanceOf(Validator)

            expect(validator._customMessages).toEqual(customMessages)
        })

        it('should support array rule format', () => {
            const factory = new ValidatorFactory()
            const dataSource = {}

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

    describe('validator', () => {
        it('should validate basic object', async () => {
            const factory = new ValidatorFactory()
            const dataSource = {
                name: 'John',
                email: 'john@example.com',
                age: 30,
                password: 'Password123!',
                website: 'https://example.com',
                items: [1, 2, 3],
                birthdate: '2000-01-01'
            }

            const validator = factory.make({
                'name': 'required',
                'email': 'required|email',
                'age': 'required|number|gt:17',
                'password': 'required|password:8,16',
                'website': 'required|url',
                'items': 'required|array_min:1|array_max:10',
                'birthdate': 'required|date:yyyy-mm-dd'
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


        it('should use custom messages', async () => {
            const factory = new ValidatorFactory()
            const dataSource = {
              email: 'not email',
              contact: {
                email: 'not email'
              }
            }

            const emailMsg = 'You must provide an valid email address'
            const validator = factory.make({
                'name': 'required',
                'email': 'required|email',
                'contact.email': 'required|email', // deep path
            }, {
                'email:email': emailMsg,
                'contact.email:email': emailMsg
            })

            await validator.validate(dataSource)

            const errors = validator.getErrors()

            expect(errors['email']).toEqual([emailMsg])
            expect(errors['contact.email']).toEqual([emailMsg])
        })

        it('should generate dependency map', async () => {
            const factory = new ValidatorFactory()
            const dataSource = {
              range: {
                min: 3,
                max: 5
              }
            }

            const validator = factory.make({
                'range.min': 'required',
                'range.max': 'required|gt:@range.min',
            })

            expect(validator.getDependentFields('range.min')).toStrictEqual(['range.max'])
            expect(validator.getDependentFields('range.max')).toStrictEqual(['range.min'])
        })

        it('should validate incomplete objects', async () => {
            const factory = new ValidatorFactory()
            const dataSource = {
                skills: [
                    { name: 'JavaScript', level: null },
                    { name: 'HTML', },
                    {}
                ],
                jobs: [
                    { start_date: '2020-01-01', end_date: '2021-01-01', current: false },
                    { start_date: '2020-01-01', end_date: null, current: false },
                    { start_date: '2021-01-01', end_date: null, current: true },
                ]
            }

            const validator = factory.make({
                'skills.*.name': 'required',
                'skills.*.level': 'required',
                'jobs.*.start_date': 'required|date',
                'jobs.*.end_date': 'required_unless:@jobs.*.current,true|date',
            })

            await validator.validate(dataSource)

            const errors = validator.getErrors()

            expect(errors['skills.0.level']).toEqual(['This field is required'])
            expect(errors['skills.1.level']).toEqual(['This field is required'])
            expect(errors['skills.2.name']).toEqual(['This field is required'])
            expect(errors['skills.2.level']).toEqual(['This field is required'])
            expect(errors['jobs.0.end_date']).toEqual(undefined)
            expect(errors['jobs.1.end_date']).toEqual(['This field is required'])
            expect(errors['jobs.2.end_date']).toEqual(undefined)

            // Verify the validator recognizes a single path
            expect(await validator.validatePath('skills.2.level', dataSource)).toBe(false)
        })
    })
})