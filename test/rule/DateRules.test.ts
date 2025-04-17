import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { DateAfter } from '../../src/rule/DateAfter'
import { DateBeforeRule } from '../../src/rule/DateBefore'
import { DateBetweenRule } from '../../src/rule/DateBetween'
import { DateFormatRule } from '../../src/rule/DateFormat'
import { Age } from '../../src/rule/Age'
import { ValidatorFactory } from '../../src/ValidatorFactory'

describe('Date Validation Rules', () => {
    // For tests involving "now", we'll mock Date
    const mockDate = new Date('2023-05-15')

    beforeAll(() => {
        vi.useFakeTimers()
        vi.setSystemTime(mockDate)
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    describe('DateAfter', () => {
        it('should validate dates after the comparison date', () => {
            const rule = new DateAfter(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('2023-01-02', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-02-01', 'path', dataSource)).toBe(true)
            expect(rule.validate('2024-01-01', 'path', dataSource)).toBe(true)
        })

        it('should invalidate dates not after the comparison date', () => {
            const rule = new DateAfter(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('2023-01-01', 'path', dataSource)).toBe(false)
            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(false)
            expect(rule.validate('2022-01-01', 'path', dataSource)).toBe(false)
        })

        it('should support "now" as comparison date', () => {
            const rule = new DateAfter(['now'])
            const dataSource = {}

            // With mocked date (2023-05-15), these should pass
            expect(rule.validate('2023-05-16', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-06-15', 'path', dataSource)).toBe(true)
            expect(rule.validate('2024-05-15', 'path', dataSource)).toBe(true)

            // With mocked date (2023-05-15), these should fail
            expect(rule.validate('2023-05-15', 'path', dataSource)).toBe(false)
            expect(rule.validate('2023-05-14', 'path', dataSource)).toBe(false)
            expect(rule.validate('2022-05-15', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for comparison date', () => {
            const rule = new DateAfter(['@min.date'])
            const dataSource = {
                min: { date: '2023-01-01' }
            }

            expect(rule.validate('2023-01-02', 'path', dataSource)).toBe(true)
            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(false)
        })

        it('should throw error if comparison date parameter is missing', () => {
            const rule = new DateAfter([])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('AfterDateRule requires a date to compare against')
        })

        it('should invalidate invalid dates', () => {
            const rule = new DateAfter(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('not-a-date', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid-date', 'path', dataSource)).toBe(false)
        })

        it('should throw error if comparison date is invalid', () => {
            const rule = new DateAfter(['not-a-date'])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('AfterDateRule comparison value is not a valid date')
        })

        it('should skip validation for empty values', () => {
            const rule = new DateAfter(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })
    })

    describe('DateBeforeRule', () => {
        it('should validate dates before the comparison date', () => {
            const rule = new DateBeforeRule(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(true)
            expect(rule.validate('2022-01-01', 'path', dataSource)).toBe(true)
            expect(rule.validate('2021-01-01', 'path', dataSource)).toBe(true)
        })

        it('should invalidate dates not before the comparison date', () => {
            const rule = new DateBeforeRule(['2023-01-01'])
            const dataSource = {}

            expect(rule.validate('2023-01-01', 'path', dataSource)).toBe(false)
            expect(rule.validate('2023-01-02', 'path', dataSource)).toBe(false)
            expect(rule.validate('2024-01-01', 'path', dataSource)).toBe(false)
        })

        it('should support "now" as comparison date', () => {
            const rule = new DateBeforeRule(['now'])
            const dataSource = {}

            // With mocked date (2023-05-15), these should pass
            expect(rule.validate('2023-05-14', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-04-15', 'path', dataSource)).toBe(true)
            expect(rule.validate('2022-05-15', 'path', dataSource)).toBe(true)

            // With mocked date (2023-05-15), these should fail
            expect(rule.validate('2023-05-15', 'path', dataSource)).toBe(false)
            expect(rule.validate('2023-05-16', 'path', dataSource)).toBe(false)
            expect(rule.validate('2024-05-15', 'path', dataSource)).toBe(false)
        })

        it('should support field reference for comparison date', () => {
            const rule = new DateBeforeRule(['@max.date'])
            const dataSource = {
                max: { date: '2023-01-01' }
            }

            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-01-02', 'path', dataSource)).toBe(false)
        })

        it('should throw error if comparison date parameter is missing', () => {
            const rule = new DateBeforeRule([])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('BeforeDateRule requires a date to compare against')
        })

        it('should throw error if comparison date is invalid', () => {
            const rule = new DateBeforeRule(['not-a-date'])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('BeforeDateRule comparison value is not a valid date')
        })
    })

    describe('DateBetweenRule', () => {
        it('should validate dates between min and max dates', () => {
            const rule = new DateBetweenRule(['2023-01-01', '2023-12-31'])
            const dataSource = {}

            expect(rule.validate('2023-01-01', 'path', dataSource)).toBe(true) // Inclusive
            expect(rule.validate('2023-06-15', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-12-31', 'path', dataSource)).toBe(true) // Inclusive
        })

        it('should invalidate dates outside min and max dates', () => {
            const rule = new DateBetweenRule(['2023-01-01', '2023-12-31'])
            const dataSource = {}

            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(false)
            expect(rule.validate('2024-01-01', 'path', dataSource)).toBe(false)
        })

        it('should support "now" as min or max date', () => {
            // min=2023-01-01, max=now (2023-05-15)
            const rule1 = new DateBetweenRule(['2023-01-01', 'now'])
            const dataSource = {}

            expect(rule1.validate('2023-01-01', 'path', dataSource)).toBe(true) // Inclusive
            expect(rule1.validate('2023-03-15', 'path', dataSource)).toBe(true)
            expect(rule1.validate('2023-05-15', 'path', dataSource)).toBe(true) // Inclusive
            expect(rule1.validate('2022-12-31', 'path', dataSource)).toBe(false)
            expect(rule1.validate('2023-05-16', 'path', dataSource)).toBe(false)

            // min=now (2023-05-15), max=2023-12-31
            const rule2 = new DateBetweenRule(['now', '2023-12-31'])

            expect(rule2.validate('2023-05-15', 'path', dataSource)).toBe(true) // Inclusive
            expect(rule2.validate('2023-08-15', 'path', dataSource)).toBe(true)
            expect(rule2.validate('2023-12-31', 'path', dataSource)).toBe(true) // Inclusive
            expect(rule2.validate('2023-05-14', 'path', dataSource)).toBe(false)
            expect(rule2.validate('2024-01-01', 'path', dataSource)).toBe(false)
        })

        it('should support field references for min and max dates', () => {
            const rule = new DateBetweenRule(['@range.min', '@range.max'])
            const dataSource = {
                range: {
                    min: '2023-01-01',
                    max: '2023-12-31'
                }
            }

            expect(rule.validate('2023-06-15', 'path', dataSource)).toBe(true)
            expect(rule.validate('2022-12-31', 'path', dataSource)).toBe(false)
            expect(rule.validate('2024-01-01', 'path', dataSource)).toBe(false)
        })

        it('should throw error if min date parameter is missing', () => {
            const rule = new DateBetweenRule([])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('DateBetweenRule requires a minimum date')
        })

        it('should throw error if max date parameter is missing', () => {
            const rule = new DateBetweenRule(['2023-01-01'])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('DateBetweenRule requires a maximum date')
        })

        it('should throw error if min date is invalid', () => {
            const rule = new DateBetweenRule(['not-a-date', '2023-12-31'])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('DateBetweenRule minimum date is not valid')
        })

        it('should throw error if max date is invalid', () => {
            const rule = new DateBetweenRule(['2023-01-01', 'not-a-date'])
            const dataSource = {}

            expect(() => rule.validate('2023-01-01', 'path', dataSource))
                .toThrow('DateBetweenRule maximum date is not valid')
        })
    })

    describe('DateFormatRule', () => {
        it('should validate dates with default format (yy-mm-dd)', () => {
            const rule = new DateFormatRule([])
            const dataSource = {}

            expect(rule.validate('23-01-01', 'path', dataSource)).toBe(true)
            expect(rule.validate('23-12-31', 'path', dataSource)).toBe(true)
            expect(rule.validate('24-02-29', 'path', dataSource)).toBe(true) // Valid leap year
            expect(rule.validate('23-13-01', 'path', dataSource)).toBe(false) // Invalid month
            expect(rule.validate('23-04-31', 'path', dataSource)).toBe(false) // Invalid day for April
        })

        it('should validate dates with legacy YYYY-MM-DD format', () => {
            const rule = new DateFormatRule(['YYYY-MM-DD'])
            const dataSource = {}

            expect(rule.validate('2023-01-01', 'path', dataSource)).toBe(true)
            expect(rule.validate('2023-12-31', 'path', dataSource)).toBe(true)
            expect(rule.validate('2024-02-29', 'path', dataSource)).toBe(true) // Valid leap year
            expect(rule.validate('2023-13-01', 'path', dataSource)).toBe(false) // Invalid month
            expect(rule.validate('2023-04-31', 'path', dataSource)).toBe(false) // Invalid day for April
        })

        it('should validate dates with various yy formats', () => {
            const dataSource = {}

            // Test yy-mm-dd format
            const yymmddRule = new DateFormatRule(['yy-mm-dd'])
            expect(yymmddRule.validate('23-01-01', 'path', dataSource)).toBe(true)
            expect(yymmddRule.validate('23-12-31', 'path', dataSource)).toBe(true)
            expect(yymmddRule.validate('23-13-01', 'path', dataSource)).toBe(false) // Invalid month

            // Test mm/dd/yy format
            const mmddyyRule = new DateFormatRule(['mm/dd/yy'])
            expect(mmddyyRule.validate('01/01/23', 'path', dataSource)).toBe(true)
            expect(mmddyyRule.validate('12/31/23', 'path', dataSource)).toBe(true)
            expect(mmddyyRule.validate('13/01/23', 'path', dataSource)).toBe(false) // Invalid month

            // Test dd/mm/yy format
            const ddmmyyRule = new DateFormatRule(['dd/mm/yy'])
            expect(ddmmyyRule.validate('01/01/23', 'path', dataSource)).toBe(true)
            expect(ddmmyyRule.validate('31/12/23', 'path', dataSource)).toBe(true)
            expect(ddmmyyRule.validate('31/13/23', 'path', dataSource)).toBe(false) // Invalid month
        })

        it('should validate dates with various legacy YYYY formats', () => {
            const dataSource = {}

            // Test DD/MM/YYYY format
            const ddmmyyyyRule = new DateFormatRule(['DD/MM/YYYY'])
            expect(ddmmyyyyRule.validate('01/01/2023', 'path', dataSource)).toBe(true)
            expect(ddmmyyyyRule.validate('31/12/2023', 'path', dataSource)).toBe(true)
            expect(ddmmyyyyRule.validate('31/13/2023', 'path', dataSource)).toBe(false) // Invalid month

            // Test MM/DD/YYYY format
            const mmddyyyyRule = new DateFormatRule(['MM/DD/YYYY'])
            expect(mmddyyyyRule.validate('01/01/2023', 'path', dataSource)).toBe(true)
            expect(mmddyyyyRule.validate('12/31/2023', 'path', dataSource)).toBe(true)
            expect(mmddyyyyRule.validate('13/01/2023', 'path', dataSource)).toBe(false) // Invalid month

            // Test YYYY/MM/DD format
            const yyyymmddRule = new DateFormatRule(['YYYY/MM/DD'])
            expect(yyyymmddRule.validate('2023/01/01', 'path', dataSource)).toBe(true)
            expect(yyyymmddRule.validate('2023/12/31', 'path', dataSource)).toBe(true)
            expect(yyyymmddRule.validate('2023/13/01', 'path', dataSource)).toBe(false) // Invalid month
        })

        it('should invalidate dates with invalid values for the month/day', () => {
            const rule = new DateFormatRule(['yy-mm-dd'])
            const dataSource = {}

            expect(rule.validate('23-04-31', 'path', dataSource)).toBe(false) // April has 30 days
            expect(rule.validate('23-06-31', 'path', dataSource)).toBe(false) // June has 30 days
            expect(rule.validate('23-09-31', 'path', dataSource)).toBe(false) // September has 30 days
            expect(rule.validate('23-11-31', 'path', dataSource)).toBe(false) // November has 30 days
            expect(rule.validate('23-02-30', 'path', dataSource)).toBe(false) // February never has 30 days
            expect(rule.validate('23-02-29', 'path', dataSource)).toBe(false) // Not a leap year
            expect(rule.validate('24-02-29', 'path', dataSource)).toBe(true)  // Valid leap year
        })

        it('should skip validation for empty values', () => {
            const rule = new DateFormatRule([])
            const dataSource = {}

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })

        it('should include the correct format in error messages', async () => {
            // Create a validator factory to test error messages
            const factory = new ValidatorFactory()
            const dataSource = {
                birth_date: '2023-13-01', // Invalid month
                start_date: '2023-04-31', // Invalid day for April
                expiry_date: '01/13/23',  // Invalid month
                event_date: '31/13/2023'  // Invalid month
            }

            // Test with default format (yy-mm-dd)
            const validator1 = factory.make({
                'birth_date': 'date'
            })
            await validator1.validate(dataSource)
            expect(validator1.getErrors()['birth_date'][0]).toContain('This field must be a valid date in the format yyyy-mm-dd')

            // Test with YYYY-MM-DD format
            const validator2 = factory.make({
                'start_date': 'date:YYYY-MM-DD'
            })
            await validator2.validate(dataSource)
            expect(validator2.getErrors()['start_date'][0]).toContain('This field must be a valid date in the format YYYY-MM-DD')

            // Test with mm/dd/yy format
            const validator3 = factory.make({
                'expiry_date': 'date:dd/mm/yy'
            })
            await validator3.validate(dataSource)
            expect(validator3.getErrors()['expiry_date'][0]).toContain('This field must be a valid date in the format dd/mm/yy')

            // Test with DD/MM/YYYY format
            const validator4 = factory.make({
                'event_date': 'date:DD/MM/YYYY'
            })
            await validator4.validate(dataSource)
            expect(validator4.getErrors()['event_date'][0]).toContain('This field must be a valid date in the format DD/MM/YYYY')
        })
    })

    describe('Age', () => {
        it('should validate dates that represent age older than minimum', () => {
            const rule = new Age(['18'])
            const dataSource = {}

            // With mocked date (2023-05-15)
            expect(rule.validate('2005-05-14', 'path', dataSource)).toBe(true) // Just over 18
            expect(rule.validate('2000-01-01', 'path', dataSource)).toBe(true) // Well over 18
            expect(rule.validate('1990-01-01', 'path', dataSource)).toBe(true) // Well over 18
        })

        it('should invalidate dates that represent age younger than minimum', () => {
            const rule = new Age(['18'])
            const dataSource = {}

            // With mocked date (2023-05-15)
            expect(rule.validate('2005-05-16', 'path', dataSource)).toBe(false) // Just under 18
            expect(rule.validate('2010-01-01', 'path', dataSource)).toBe(false) // Well under 18
            expect(rule.validate('2023-01-01', 'path', dataSource)).toBe(false) // Infant
        })

        it('should handle edge case with birthdays', () => {
            const rule = new Age(['18'])
            const dataSource = {}

            // With mocked date (2023-05-15)
            expect(rule.validate('2005-05-15', 'path', dataSource)).toBe(true) // Exactly 18 today
        })

        it('should throw error if minimum age parameter is missing', () => {
            const rule = new Age([])
            const dataSource = {}

            expect(() => rule.validate('2000-01-01', 'path', dataSource))
                .toThrow('AgeRule requires a minimum age parameter')
        })

        it('should throw error if minimum age is invalid', () => {
            const rule = new Age(['not-a-number'])
            const dataSource = {}

            expect(() => rule.validate('2000-01-01', 'path', dataSource))
                .toThrow('AgeRule minimum age must be a non-negative integer')
        })

        it('should throw error if minimum age is negative', () => {
            const rule = new Age(['-1'])
            const dataSource = {}

            expect(() => rule.validate('2000-01-01', 'path', dataSource))
                .toThrow('AgeRule minimum age must be a non-negative integer')
        })

        it('should invalidate invalid dates', () => {
            const rule = new Age(['18'])
            const dataSource = {}

            expect(rule.validate('not-a-date', 'path', dataSource)).toBe(false)
            expect(rule.validate('invalid-date', 'path', dataSource)).toBe(false)
        })

        it('should skip validation for empty values', () => {
            const rule = new Age(['18'])
            const dataSource = {}

            expect(rule.validate('', 'path', dataSource)).toBe(true)
            expect(rule.validate(null, 'path', dataSource)).toBe(true)
            expect(rule.validate(undefined, 'path', dataSource)).toBe(true)
        })
    })
})