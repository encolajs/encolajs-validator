import { DataSourceInterface } from './DataSourceInterface'
import PathResolver from './../PathResolver'

export class PlainObjectDataSource implements DataSourceInterface {
  private _data: Record<string, any>

  constructor(data: Record<string, any> = {}) {
    this._data = data || {}
  }

  getValue(path: string): any {
    if (!path) return this._data

    const segments = PathResolver.splitPath(path)
    let current: any = this._data

    for (const segment of segments) {
      if (current === undefined || current === null) {
        return undefined
      }

      // Handle numeric segments as array indices
      if (/^\d+$/.test(segment)) {
        const index = parseInt(segment, 10)

        if (
          !Array.isArray(current) ||
          isNaN(index) ||
          index < 0 ||
          index >= current.length
        ) {
          return undefined
        }

        current = current[index]
      } else {
        // Handle object property access
        if (typeof current !== 'object') {
          return undefined
        }

        current = current[segment]
      }
    }

    return current
  }

  /**
   * Set a value in the data structure
   * @param path - Path to set
   * @param value - Value to set
   */
  setValue(path: string, value: any): void {
    if (!path) {
      if (typeof value === 'object' && value !== null) {
        this._data = value
      }
      return
    }

    const segments = PathResolver.splitPath(path)
    const lastSegment = segments.pop()

    if (!lastSegment) return

    // Handle the case where we only have one segment
    if (segments.length === 0) {
      if (/^\d+$/.test(lastSegment)) {
        // If the path is a numeric index, ensure _data is an array
        if (!Array.isArray(this._data)) {
          this._data = []
        }
        const index = parseInt(lastSegment, 10)
        if (isNaN(index) || index < 0) {
          return
        }
        // Ensure array has the required length
        while (this._data.length <= index) {
          this._data.push(undefined)
        }
        this._data[index] = value
      } else {
        // Regular property
        if (
          this._data === undefined ||
          this._data === null ||
          typeof this._data !== 'object'
        ) {
          this._data = {}
        }
        this._data[lastSegment] = value
      }
      return
    }

    // If we have multiple segments, we need to build the path
    let current = this._data
    let parent = null
    let parentKey = null

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const isNumeric = /^\d+$/.test(segment)
      const nextSegment =
        i < segments.length - 1 ? segments[i + 1] : lastSegment
      const nextIsNumeric = /^\d+$/.test(nextSegment)

      // Determine if the current path needs to be an array or object
      if (isNumeric) {
        // Current segment is numeric, ensure parent has an array here
        const index = parseInt(segment, 10)
        if (isNaN(index) || index < 0) {
          continue
        }

        if (!Array.isArray(current)) {
          // Convert current to array if needed
          if (parent && parentKey) {
            current = parent[parentKey] = []
          } else {
            current = this._data = []
          }
        }

        // Ensure array has enough elements
        while (current.length <= index) {
          current.push(undefined)
        }

        // Set up for the next level
        if (nextIsNumeric) {
          // Next level needs to be an array
          if (
            current[index] === undefined ||
            current[index] === null ||
            !Array.isArray(current[index])
          ) {
            current[index] = []
          }
        } else {
          // Next level needs to be an object
          if (
            current[index] === undefined ||
            current[index] === null ||
            typeof current[index] !== 'object' ||
            Array.isArray(current[index])
          ) {
            current[index] = {}
          }
        }

        parent = current
        parentKey = index
        current = current[index]
      } else {
        // Current segment is a property name, ensure current is an object
        if (
          current === undefined ||
          current === null ||
          typeof current !== 'object'
        ) {
          // Convert current to object if needed
          if (parent && parentKey) {
            current = parent[parentKey] = {}
          } else {
            current = this._data = {}
          }
        }

        // Set up for the next level
        if (nextIsNumeric) {
          // Next level needs to be an array
          if (
            current[segment] === undefined ||
            current[segment] === null ||
            !Array.isArray(current[segment])
          ) {
            current[segment] = []
          }
        } else {
          // Next level needs to be an object
          if (
            current[segment] === undefined ||
            current[segment] === null ||
            typeof current[segment] !== 'object' ||
            Array.isArray(current[segment])
          ) {
            current[segment] = {}
          }
        }

        parent = current
        parentKey = segment
        current = current[segment]
      }
    }

    // Now set the final value
    if (/^\d+$/.test(lastSegment)) {
      // Final segment is numeric, ensure current is an array
      if (!Array.isArray(current)) {
        if (parent && parentKey) {
          current = parent[parentKey] = []
        } else {
          current = this._data = []
        }
      }

      const index = parseInt(lastSegment, 10)
      if (isNaN(index) || index < 0) {
        return
      }

      // Ensure array has enough elements
      while (current.length <= index) {
        current.push(undefined)
      }

      current[index] = value
    } else {
      // Final segment is a property name, ensure current is an object
      if (
        current === undefined ||
        current === null ||
        typeof current !== 'object'
      ) {
        if (parent && parentKey) {
          current = parent[parentKey] = {}
        } else {
          current = this._data = {}
        }
      }

      current[lastSegment] = value
    }
  }
  /**
   * Check if a path exists in the data structure
   * @param path - Path to check
   * @returns Whether the path exists
   */
  hasPath(path: string): boolean {
    return this.getValue(path) !== undefined
  }

  /**
   * Remove a path from the data structure
   * @param path - Path to remove
   */
  removePath(path: string): void {
    if (!path) return

    const segments = PathResolver.splitPath(path)
    const lastSegment = segments.pop()

    if (!lastSegment) return

    // Traverse to the parent
    let current: any = this._data

    for (const segment of segments) {
      if (current === undefined || current === null) {
        return
      }

      // Handle numeric segments as array indices
      if (/^\d+$/.test(segment)) {
        const index = parseInt(segment, 10)

        if (
          !Array.isArray(current) ||
          isNaN(index) ||
          index < 0 ||
          index >= current.length
        ) {
          return
        }

        current = current[index]
      } else {
        // Handle object property access
        if (typeof current !== 'object') {
          return
        }

        current = current[segment]
      }
    }

    if (current === undefined || current === null) {
      return
    }

    // Remove the value from the parent
    if (/^\d+$/.test(lastSegment)) {
      const index = parseInt(lastSegment, 10)

      if (
        Array.isArray(current) &&
        !isNaN(index) &&
        index >= 0 &&
        index < current.length
      ) {
        current.splice(index, 1)
      }
    } else {
      if (typeof current === 'object') {
        delete current[lastSegment]
      }
    }
  }

  /**
   * Get the raw data object
   * @returns The raw data
   */
  getRawData(): Record<string, any> {
    return this._data
  }

  clone(): DataSourceInterface {
    return new PlainObjectDataSource(JSON.parse(JSON.stringify(this._data)))
  }
}
