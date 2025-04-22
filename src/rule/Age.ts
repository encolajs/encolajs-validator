import { ValidationRule } from '../ValidationRule'
import { isEmpty } from '../util/isEmpty'
import { parseDate } from '../util/dateParser'

export class Age extends ValidationRule {
  validate(value: any, path: string, data: object): boolean {
    if (isEmpty(value)) {
      return true
    }

    // Get the minimum age and format
    const minAge = this.parameters?.[0]
    const format = this.parameters?.[1]

    if (minAge === undefined) {
      throw new Error('AgeRule requires a minimum age parameter')
    }

    const parsedMinAge = parseInt(minAge, 10)
    if (isNaN(parsedMinAge) || parsedMinAge < 0) {
      throw new Error('AgeRule minimum age must be a non-negative integer')
    }

    // Parse the date of birth
    const parsedBirthDate = parseDate(value, format)
    if (!parsedBirthDate.isValid) {
      return false
    }

    const birthDate = parsedBirthDate.date!

    // Calculate age
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age >= parsedMinAge
  }
}
