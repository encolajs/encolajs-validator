import { describe, it, expect } from 'vitest'
import PathResolver from '../src/PathResolver'

describe('PathResolver', () => {
    describe('isValidPath', () => {
        it('should return true for valid paths', () => {
            expect(PathResolver.isValidPath('user')).toBe(true)
            expect(PathResolver.isValidPath('user.name')).toBe(true)
            expect(PathResolver.isValidPath('users.0.name')).toBe(true)
        })

        it('should return false for invalid paths', () => {
            expect(PathResolver.isValidPath('')).toBe(false)
            expect(PathResolver.isValidPath(null as any)).toBe(false)
            expect(PathResolver.isValidPath(undefined as any)).toBe(false)
        })
    })

    describe('getParentPath', () => {
        it('should get parent path', () => {
            expect(PathResolver.getParentPath('user.name')).toBe('user')
            expect(PathResolver.getParentPath('users.0.email')).toBe('users.0')
            expect(PathResolver.getParentPath('users.0')).toBe('users')
        })

        it('should return null for top-level paths', () => {
            expect(PathResolver.getParentPath('user')).toBeNull()
        })

        it('should return null for invalid paths', () => {
            expect(PathResolver.getParentPath('')).toBeNull()
            expect(PathResolver.getParentPath(null as any)).toBeNull()
        })
    })

    describe('extractArrayInfo', () => {
        it('should extract array info from paths', () => {
            expect(PathResolver.extractArrayInfo('users.0')).toEqual({
                path: 'users',
                index: 0
            })
            expect(PathResolver.extractArrayInfo('users.items.3')).toEqual({
                path: 'users.items',
                index: 3
            })
            expect(PathResolver.extractArrayInfo('users.*')).toEqual({
                path: 'users',
                index: '*'
            })
        })

        it('should return null for non-array paths', () => {
            expect(PathResolver.extractArrayInfo('user')).toBeNull()
            expect(PathResolver.extractArrayInfo('user.name')).toBeNull()
        })
    })

    describe('splitPath', () => {
        it('should split paths correctly', () => {
            expect(PathResolver.splitPath('user')).toEqual(['user'])
            expect(PathResolver.splitPath('user.name')).toEqual(['user', 'name'])
            expect(PathResolver.splitPath('users.0.name')).toEqual(['users', '0', 'name'])
        })

        it('should handle invalid paths', () => {
            expect(PathResolver.splitPath('')).toEqual([])
            expect(PathResolver.splitPath(null as any)).toEqual([])
        })
    })

    describe('joinPath', () => {
        it('should join path segments correctly', () => {
            expect(PathResolver.joinPath(['user'])).toBe('user')
            expect(PathResolver.joinPath(['user', 'name'])).toBe('user.name')
            expect(PathResolver.joinPath(['users', '0', 'name'])).toBe('users.0.name')
        })

        it('should handle invalid segments', () => {
            expect(PathResolver.joinPath([])).toBe('')
            expect(PathResolver.joinPath(null as any)).toBe('')
        })
    })

    describe('normalizePath', () => {
        it('should normalize paths correctly', () => {
            expect(PathResolver.normalizePath('user.name')).toBe('user.name')
            expect(PathResolver.normalizePath('users.0.name')).toBe('users.0.name')
        })

        it('should handle invalid paths', () => {
            expect(PathResolver.normalizePath('')).toBe('')
        })
    })

    describe('matchesPattern', () => {
        it('should match exact patterns', () => {
            expect(PathResolver.matchesPattern('user.name', 'user.name')).toBe(true)
            expect(PathResolver.matchesPattern('users.0.name', 'users.0.name')).toBe(true)
        })

        it('should match wildcard patterns', () => {
            expect(PathResolver.matchesPattern('users.0.name', 'users.*')).toBe(true)
            expect(PathResolver.matchesPattern('users.0.name', 'users.0.*')).toBe(true)
            expect(PathResolver.matchesPattern('users.0.name', '*')).toBe(true)
        })

        it('should not match non-matching patterns', () => {
            expect(PathResolver.matchesPattern('user.name', 'user.email')).toBe(false)
            expect(PathResolver.matchesPattern('users.0.name', 'users.1.name')).toBe(false)
            expect(PathResolver.matchesPattern('user', 'user.name')).toBe(false)
        })
    })

    describe('bracketToDotNotation', () => {
        it('should convert bracket notation to dot notation', () => {
            expect(PathResolver.bracketToDotNotation('items[0].name')).toBe('items.0.name')
            expect(PathResolver.bracketToDotNotation('items[0][name]')).toBe('items.0.name')
            expect(PathResolver.bracketToDotNotation('items[first][second]')).toBe('items.first.second')
        })

        it('should handle paths without brackets', () => {
            expect(PathResolver.bracketToDotNotation('user.name')).toBe('user.name')
            expect(PathResolver.bracketToDotNotation('')).toBe('')
            expect(PathResolver.bracketToDotNotation(null as any)).toBe(null)
        })
    })

    describe('dotToBracketNotation', () => {
        it('should convert dot notation to bracket notation for numeric indices', () => {
            expect(PathResolver.dotToBracketNotation('items.0.name')).toBe('items[0].name')
            expect(PathResolver.dotToBracketNotation('items.0.1.name')).toBe('items[0][1].name')
        })

        it('should keep string properties in dot notation', () => {
            expect(PathResolver.dotToBracketNotation('user.name')).toBe('user.name')
            expect(PathResolver.dotToBracketNotation('items.0.name.first')).toBe('items[0].name.first')
        })

        it('should handle empty paths', () => {
            expect(PathResolver.dotToBracketNotation('')).toBe('')
            expect(PathResolver.dotToBracketNotation(null as any)).toBe(null)
        })
    })

    describe('resolveReferencePath', () => {
        it('should resolve simple path', () => {
            expect(PathResolver.resolveReferencePath('@user', 'email')).toBe('user')
            expect(PathResolver.resolveReferencePath('@user', 'skills.0.name')).toBe('user')
        })
        it('should resolve nested paths', () => {
            expect(PathResolver.resolveReferencePath('@skills.*.name', 'skills.2.level')).toBe('skills.2.name')
            expect(PathResolver.resolveReferencePath('@jobs.*.supervisors.*.name', 'jobs.2.supervisors.3.email')).toBe('jobs.2.supervisors.3.name')
        })
        it('should not resolve non-matching nested paths', () => {
            expect(PathResolver.resolveReferencePath('@jobs.*.name', 'skills.2.level')).toBe(null)
        })
    })
})