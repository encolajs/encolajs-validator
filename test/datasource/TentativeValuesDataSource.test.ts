import { describe, it, expect, vi } from 'vitest'
import { TentativeValuesDataSource } from '../../src/datasource/TentativeValuesDataSource'
import { createMockDataSource } from '../utils'
import { PlainObjectDataSource } from '../../src/datasource/PlainObjectDataSource'

describe('TentativeValuesDataSource', () => {
    describe('constructor', () => {
        it('should initialize with base data source and empty tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {})

            expect(dataSource.getTentativeValues()).toEqual({})
        })

        it('should initialize with base data source and provided tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const tentativeValues = { 'name': 'Jane', 'age': 30 }
            const dataSource = new TentativeValuesDataSource(baseDataSource, tentativeValues)

            expect(dataSource.getTentativeValues()).toEqual(tentativeValues)
        })
    })

    describe('getValue', () => {
        it('should get tentative value if it exists', () => {
            const baseDataSource = createMockDataSource({
                name: 'John',
                age: 30
            })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane'
            })

            expect(dataSource.getValue('name')).toBe('Jane')
            expect(baseDataSource.getValue).not.toHaveBeenCalledWith('name')
        })

        it('should fall back to base data source if no tentative value exists', () => {
            const baseDataSource = createMockDataSource({
                name: 'John',
                age: 30
            })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane'
            })

            expect(dataSource.getValue('age')).toBe(30)
            expect(baseDataSource.getValue).toHaveBeenCalledWith('age')
        })

        it('should handle nested paths consistently', () => {
            const baseDataSource = createMockDataSource({
                user: {
                    name: 'John',
                    address: {
                        city: 'New York'
                    }
                }
            })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'user.name': 'Jane',
                'user.address.zip': '10001'
            })

            expect(dataSource.getValue('user.name')).toBe('Jane')
            expect(dataSource.getValue('user.address.city')).toBe('New York')
            expect(dataSource.getValue('user.address.zip')).toBe('10001')
        })
    })

    describe('setValue', () => {
        it('should store value in tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {})

            dataSource.setValue('name', 'Jane')

            expect(dataSource.getTentativeValues()).toEqual({ 'name': 'Jane' })
            expect(dataSource.getValue('name')).toBe('Jane')
            expect(baseDataSource.setValue).not.toHaveBeenCalled()
        })

        it('should not modify base data source until commit', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {})

            dataSource.setValue('name', 'Jane')
            dataSource.setValue('age', 30)

            expect(baseDataSource.setValue).not.toHaveBeenCalled()
            expect(baseDataSource.getValue('name')).toBe('John')
        })
    })

    describe('commit', () => {
        it('should commit tentative value to base data source', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane',
                'age': 30
            })

            const result = dataSource.commit('name')

            expect(result).toBe(true)
            expect(baseDataSource.setValue).toHaveBeenCalledWith('name', 'Jane')
            expect(dataSource.getTentativeValues()).toEqual({ 'age': 30 })
        })

        it('should return false if path does not have a tentative value', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'age': 30
            })

            const result = dataSource.commit('name')

            expect(result).toBe(false)
            expect(baseDataSource.setValue).not.toHaveBeenCalled()
            expect(dataSource.getTentativeValues()).toEqual({ 'age': 30 })
        })
    })

    describe('commitAll', () => {
        it('should commit all tentative values to base data source', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane',
                'age': 30,
                'user.address.city': 'New York'
            })

            dataSource.commitAll()

            expect(baseDataSource.setValue).toHaveBeenCalledWith('name', 'Jane')
            expect(baseDataSource.setValue).toHaveBeenCalledWith('age', 30)
            expect(baseDataSource.setValue).toHaveBeenCalledWith('user.address.city', 'New York')
            expect(dataSource.getTentativeValues()).toEqual({})
        })

        it('should do nothing if there are no tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {})

            dataSource.commitAll()

            expect(baseDataSource.setValue).not.toHaveBeenCalled()
        })
    })

    describe('hasPath', () => {
        it('should return true if path exists in tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'age': 30
            })

            expect(dataSource.hasPath('age')).toBe(true)
            expect(baseDataSource.hasPath).not.toHaveBeenCalledWith('age')
        })

        it('should check base data source if path not in tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            baseDataSource.hasPath = vi.fn().mockReturnValue(true)

            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'age': 30
            })

            expect(dataSource.hasPath('name')).toBe(true)
            expect(baseDataSource.hasPath).toHaveBeenCalledWith('name')
        })
    })

    describe('hasTentativeValue', () => {
        it('should return true if path has tentative value', () => {
            const baseDataSource = createMockDataSource({})
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane',
                'user.age': 30
            })

            expect(dataSource.hasTentativeValue('name')).toBe(true)
            expect(dataSource.hasTentativeValue('user.age')).toBe(true)
        })

        it('should return false if path has no tentative value', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'age': 30
            })

            expect(dataSource.hasTentativeValue('name')).toBe(false)
            expect(dataSource.hasTentativeValue('email')).toBe(false)
        })
    })

    describe('removePath', () => {
        it('should remove path from tentative values if it exists', () => {
            const baseDataSource = createMockDataSource({})
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane',
                'age': 30
            })

            dataSource.removePath('name')

            expect(dataSource.getTentativeValues()).toEqual({ 'age': 30 })
            expect(baseDataSource.removePath).not.toHaveBeenCalled()
        })

        it('should delegate to base data source if path not in tentative values', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'age': 30
            })

            dataSource.removePath('name')

            expect(baseDataSource.removePath).toHaveBeenCalledWith('name')
            expect(dataSource.getTentativeValues()).toEqual({ 'age': 30 })
        })
    })

    describe('getRawData', () => {
        it('should merge base data with tentative values', () => {
            const baseDataSource = new PlainObjectDataSource({
                name: 'John',
                user: {
                    age: 30,
                    address: {
                        city: 'Boston'
                    }
                },
                items: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' }
                ]
            })

            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'name': 'Jane',
                'user.age': 25,
                'user.address.city': 'New York',
                'user.address.zip': '10001',
                'items.0.name': 'Updated Item 1',
                'items.2.name': 'Item 3'
            })

            const rawData = dataSource.getRawData()

            expect(rawData).toEqual({
                name: 'Jane',
                user: {
                    age: 25,
                    address: {
                        city: 'New York',
                        zip: '10001'
                    }
                },
                items: [
                    { id: 1, name: 'Updated Item 1' },
                    { id: 2, name: 'Item 2' },
                    { name: 'Item 3' }
                ]
            })
        })

        it('should handle numeric paths correctly', () => {
            const baseDataSource = new PlainObjectDataSource({
                items: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' }
                ]
            })

            const dataSource = new TentativeValuesDataSource(baseDataSource, {
                'items.1': { id: 3, name: 'Updated Item 2' },
                'items.2': { id: 4, name: 'Item 3' }
            })

            const rawData = dataSource.getRawData()

            expect(rawData).toEqual({
                items: [
                    { id: 1, name: 'Item 1' },
                    { id: 3, name: 'Updated Item 2' },
                    { id: 4, name: 'Item 3' }
                ]
            })
        })
    })

    describe('clone', () => {
        it('should create a deep copy with cloned base data source', () => {
            const baseDataSource = createMockDataSource({ name: 'John' })
            baseDataSource.clone = vi.fn().mockReturnValue(createMockDataSource({ name: 'John' }))

            const tentativeValues = { 'age': 30 }
            const dataSource = new TentativeValuesDataSource(baseDataSource, tentativeValues)

            const clone = dataSource.clone() as TentativeValuesDataSource

            expect(baseDataSource.clone).toHaveBeenCalled()
            expect(clone.getTentativeValues()).toEqual(tentativeValues)
            expect(clone.getTentativeValues()).not.toBe(tentativeValues) // Should be a copy
        })
    })
})