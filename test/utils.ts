import { describe, it, expect, vi } from 'vitest'
import { ValidationRule } from '../src/ValidationRule'
import { DataSourceInterface } from '../src/datasource/DataSourceInterface'
import { PlainObjectDataSource } from '../src/datasource/PlainObjectDataSource'

/**
 * Create a mock validation rule for testing
 * @param validateResult The result to return from validate()
 * @returns A mock validation rule
 */
export function createMockRule(validateResult: boolean | Promise<boolean> = true): ValidationRule {
    return {
        parameters: [],
        validate: vi.fn().mockReturnValue(validateResult),
        resolveParameter: vi.fn((param) => param)
    } as unknown as ValidationRule
}

/**
 * Create a mock data source for testing
 * @param data Initial data
 * @returns A mock data source
 */
export function createMockDataSource(data: Record<string, any> = {}): DataSourceInterface {
    return {
        getValue: vi.fn((path) => {
            if (!path) return data
            return path.split('.').reduce((obj, key) => obj?.[key], data)
        }),
        setValue: vi.fn((path, value) => {
            const parts = path.split('.')
            const lastPart = parts.pop()
            if (!lastPart) return

            let current = data
            for (const part of parts) {
                if (current[part] === undefined) {
                    current[part] = {}
                }
                current = current[part]
            }
            current[lastPart] = value
        }),
        hasPath: vi.fn((path) => {
            if (!path) return true
            let current = data
            for (const part of path.split('.')) {
                if (current === undefined || current === null) {
                    return false
                }
                current = current[part]
            }
            return current !== undefined
        }),
        removePath: vi.fn((path) => {
            const parts = path.split('.')
            const lastPart = parts.pop()
            if (!lastPart) return

            let current = data
            for (const part of parts) {
                if (current === undefined || current === null) {
                    return
                }
                current = current[part]
            }
            delete current[lastPart]
        }),
        getRawData: vi.fn(() => data),
        clone: vi.fn(() => createMockDataSource({ ...data }))
    }
}

/**
 * Create a real data source for integration testing
 * @param data Initial data
 * @returns A real PlainObjectDataSource
 */
export function createRealDataSource(data: Record<string, any> = {}): DataSourceInterface {
    return new PlainObjectDataSource(data)
}