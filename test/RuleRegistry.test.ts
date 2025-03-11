import { describe, it, expect, vi } from 'vitest'
import { RuleRegistry } from '../src/RuleRegistry'
import { ValidationRule } from '../src/ValidationRule'
import { createMockRule } from './utils'

describe('RuleRegistry', () => {
    describe('register', () => {
        it('should register a rule factory and default message', () => {
            const registry = new RuleRegistry()
            const factory = vi.fn().mockReturnValue(createMockRule())

            registry.register('test', factory, 'Test message')

            expect(registry.has('test')).toBe(true)
            expect(registry.getDefaultMessage('test')).toBe('Test message')
        })

        it('should throw error if factory is not a function', () => {
            const registry = new RuleRegistry()

            expect(() => registry.register('test', null as any, 'Test message'))
                .toThrow('Rule factory must be a function')
        })

        it('should return registry instance for method chaining', () => {
            const registry = new RuleRegistry()
            const factory = vi.fn().mockReturnValue(createMockRule())

            const result = registry.register('test', factory, 'Test message')

            expect(result).toBe(registry)
        })
    })

    describe('get', () => {
        it('should get a rule instance using the factory', () => {
            const registry = new RuleRegistry()
            const mockRule = createMockRule()
            const factory = vi.fn().mockReturnValue(mockRule)

            registry.register('test', factory, 'Test message')

            const rule = registry.get('test', ['param1', 'param2'])

            expect(rule).toBe(mockRule)
            expect(factory).toHaveBeenCalledWith(['param1', 'param2'])
        })

        it('should return undefined for non-existent rules', () => {
            const registry = new RuleRegistry()

            const rule = registry.get('unknown', [])

            expect(rule).toBeUndefined()
        })
    })

    describe('has', () => {
        it('should return true for registered rules', () => {
            const registry = new RuleRegistry()
            const factory = vi.fn().mockReturnValue(createMockRule())

            registry.register('test', factory, 'Test message')

            expect(registry.has('test')).toBe(true)
        })

        it('should return false for non-registered rules', () => {
            const registry = new RuleRegistry()

            expect(registry.has('unknown')).toBe(false)
        })
    })

    describe('getDefaultMessage', () => {
        it('should return default message for registered rules', () => {
            const registry = new RuleRegistry()
            const factory = vi.fn().mockReturnValue(createMockRule())

            registry.register('test', factory, 'Test message')

            expect(registry.getDefaultMessage('test')).toBe('Test message')
        })

        it('should return undefined for non-registered rules', () => {
            const registry = new RuleRegistry()

            expect(registry.getDefaultMessage('unknown')).toBeUndefined()
        })
    })
})