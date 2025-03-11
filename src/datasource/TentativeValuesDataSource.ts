import { DataSourceInterface } from './DataSourceInterface'
import PathResolver from '../PathResolver'

export class TentativeValuesDataSource implements DataSourceInterface {
  constructor(
    private baseDataSource: DataSourceInterface,
    private tentativeValues: Record<string, any>
  ) {}

  getValue(path: string): any {
    if (path in this.tentativeValues) {
      return this.tentativeValues[path]
    }
    return this.baseDataSource.getValue(path)
  }

  setValue(path: string, value: any): void {
    this.tentativeValues[path] = value
  }

  commit(path: string): boolean {
    if (path in this.tentativeValues) {
      this.baseDataSource.setValue(path, this.tentativeValues[path])
      delete this.tentativeValues[path]
      return true
    }
    return false
  }

  commitAll(): void {
    for (const [path, value] of Object.entries(this.tentativeValues)) {
      this.baseDataSource.setValue(path, value)
    }
    this.tentativeValues = {}
  }

  hasPath(path: string): boolean {
    return path in this.tentativeValues || this.baseDataSource.hasPath(path)
  }

  hasTentativeValue(path: string): boolean {
    return path in this.tentativeValues
  }

  getTentativeValues(): Record<string, any> {
    return { ...this.tentativeValues }
  }

  removePath(path: string): void {
    if (path in this.tentativeValues) {
      delete this.tentativeValues[path]
      return
    }
    this.baseDataSource.removePath(path)
  }

  getRawData(): any {
    const data = { ...this.baseDataSource.getRawData() }

    for (const [path, value] of Object.entries(this.tentativeValues)) {
      const pathParts = PathResolver.splitPath(path)
      let current = data

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]

        // If the part is numeric, treat as array index
        if (/^\d+$/.test(part)) {
          const index = parseInt(part, 10)
          if (!Array.isArray(current)) {
            current = []
          }
          if (current[index] === undefined) {
            current[index] = {}
          }
          current = current[index]
        } else {
          if (current[part] === undefined) {
            current[part] = {}
          }
          current = current[part]
        }
      }

      const lastPart = pathParts[pathParts.length - 1]
      // If the last part is numeric, treat as array index
      if (/^\d+$/.test(lastPart)) {
        const index = parseInt(lastPart, 10)
        if (!Array.isArray(current)) {
          current = []
        }
        current[index] = value
      } else {
        current[lastPart] = value
      }
    }

    return data
  }

  clone(): DataSourceInterface {
    return new TentativeValuesDataSource(this.baseDataSource.clone(), {
      ...this.tentativeValues,
    })
  }
}
