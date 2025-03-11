/**
 * Interface for data sources
 */
export interface DataSourceInterface {
  /**
   * Get a value from the data structure
   * @param path - Path to the value
   * @returns The value at the specified path
   */
  getValue(path: string): any

  /**
   * Set a value in the data structure
   * @param path - Path to set
   * @param value - Value to set
   */
  setValue(path: string, value: any): void

  /**
   * Check if a path exists in the data structure
   * @param path - Path to check
   * @returns Whether the path exists
   */
  hasPath(path: string): boolean

  /**
   * Remove a path from the data structure
   * @param path - Path to remove
   */
  removePath(path: string): void

  /**
   * Get the raw data object
   * @returns The raw data
   */
  getRawData(): any

  clone(): DataSourceInterface
}
