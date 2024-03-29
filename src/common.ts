import type { Type } from './types'

// TODO: TTL
// TODO: Materialized columns
// TODO: alias
// TODO: default values
// TODO: ephemeral columns
// see https://clickhouse.com/docs/en/sql-reference/statements/create/table#syntax-forms
export type Shape = {
  [key: string]: Type
}

export type Infer<S extends Shape> = {
  [Field in keyof S]: S[Field]['underlying']
}

export type NonEmptyArray<T> = [T, ...T[]]

// Adjusted from https://stackoverflow.com/a/71670966/4575540
export type NonNegative<N extends number> = number extends N
  ? N
  : `${N}` extends `-${string}`
    ? never
    : N
