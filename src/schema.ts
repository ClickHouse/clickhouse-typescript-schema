import type { Shape } from './common'

export interface SchemaToStringOptions {
  tab_width?: number
  separator?: string
  pretty?: boolean
}

export class Schema<S extends Shape> {
  constructor(public readonly shape: S) {}

  toString(options?: SchemaToStringOptions): string {
    if (options?.pretty) {
      const tab = ' '.repeat(options.tab_width ?? 2)
      return (
        '\n' +
        Object.entries(this.shape)
          .map(([column, type]) => `${tab}${column} ${type.toString()}`)
          .join(options.separator ?? ',\n') +
        '\n'
      )
    } else {
      return Object.entries(this.shape)
        .map(([column, type]) => `${column} ${type.toString()}`)
        .join(options?.separator ?? ', ')
    }
  }
}

export function createSchema<S extends Shape>(shape: S): Schema<S> {
  return new Schema(shape)
}
