import { describe, it, expect } from 'vitest'
import { parseDate } from '../../src/util/dateParser'

describe('parseDate', () => {
  describe('with Date objects', () => {
    it('should return valid Date object when given a valid Date', () => {
      const validDate = new Date('2023-01-15')
      const result = parseDate(validDate)

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(validDate)
    })

    it('should return invalid result when given an invalid Date', () => {
      const invalidDate = new Date('invalid-date')
      const result = parseDate(invalidDate)

      expect(result.isValid).toBe(false)
      expect(result.date).toBeNull()
    })
  })

  describe('without format specification', () => {
    it('should parse ISO date string correctly', () => {
      const result = parseDate('2023-01-15')

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(new Date('2023-01-15'))
    })

    it('should return invalid result for non-ISO date string', () => {
      const result = parseDate('01/15/2023', 'dd/mm/yy')

      expect(result.isValid).toBe(false)
      expect(result.date).toBeNull()
    })

    it('should return invalid result for invalid date string', () => {
      const result = parseDate('invalid-date')

      expect(result.isValid).toBe(false)
      expect(result.date).toBeNull()
    })
  })

  describe('with format specification', () => {
    describe('new JS-style formats', () => {
      it('should parse yy-mm-dd format correctly', () => {
        const result = parseDate('23-01-15', 'yy-mm-dd')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse mm/dd/yy format correctly', () => {
        const result = parseDate('01/15/23', 'mm/dd/yy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse dd/mm/yy format correctly', () => {
        const result = parseDate('15/01/23', 'dd/mm/yy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse yy/mm/dd format correctly', () => {
        const result = parseDate('23/01/15', 'yy/mm/dd')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse mm-dd-yy format correctly', () => {
        const result = parseDate('01-15-23', 'mm-dd-yy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse dd-mm-yy format correctly', () => {
        const result = parseDate('15-01-23', 'dd-mm-yy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })
    })

    describe('legacy YYYY formats', () => {
      it('should parse yyyy-mm-dd format correctly', () => {
        const result = parseDate('2023-01-15', 'yyyy-mm-dd')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse mm/dd/yyyy format correctly', () => {
        const result = parseDate('01/15/2023', 'mm/dd/yyyy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse dd/mm/yyyy format correctly', () => {
        const result = parseDate('15/01/2023', 'dd/mm/yyyy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse yyyy/mm/dd format correctly', () => {
        const result = parseDate('2023/01/15', 'yyyy/mm/dd')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse mm-dd-yyyy format correctly', () => {
        const result = parseDate('01-15-2023', 'mm-dd-yyyy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse dd-mm-yyyy format correctly', () => {
        const result = parseDate('15-01-2023', 'dd-mm-yyyy')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })
    })

    describe('legacy uppercase formats', () => {
      it('should parse YYYY-MM-DD format correctly', () => {
        const result = parseDate('2023-01-15', 'YYYY-MM-DD')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse MM/DD/YYYY format correctly', () => {
        const result = parseDate('01/15/2023', 'MM/DD/YYYY')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })

      it('should parse DD/MM/YYYY format correctly', () => {
        const result = parseDate('15/01/2023', 'DD/MM/YYYY')

        expect(result.isValid).toBe(true)
        expect(result.date).toEqual(new Date('2023-01-15'))
      })
    })

    describe('invalid dates', () => {
      it('should return invalid result for date with invalid month', () => {
        const result = parseDate('2023-13-15', 'yyyy-mm-dd')

        expect(result.isValid).toBe(false)
        expect(result.date).toBeNull()
      })

      it('should return invalid result for date with invalid day', () => {
        const result = parseDate('2023-01-32', 'yyyy-mm-dd')

        expect(result.isValid).toBe(false)
        expect(result.date).toBeNull()
      })

      it('should return invalid result for date with invalid format', () => {
        const result = parseDate('2023-01-15', 'invalid-format')

        expect(result.isValid).toBe(false)
        expect(result.date).toBeNull()
      })

      it('should return invalid result for date string that does not match format', () => {
        const result = parseDate('01/15/2023', 'yyyy-mm-dd')

        expect(result.isValid).toBe(false)
        expect(result.date).toBeNull()
      })
    })
  })
})