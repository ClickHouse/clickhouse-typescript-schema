import type { TableEngine } from './engines'
import type { Schema } from './schema'
import type { NonEmptyArray, Shape } from './common'
import { QueryFormatter } from './query_formatter'
import type { WhereExpr } from './where'
import type {
  ClickHouseSettings,
  MergeTreeSettings,
} from '@clickhouse/client-common'

// TODO: non-empty schema constraint
// TODO support more formats (especially JSONCompactEachRow)
export interface TableOptions<S extends Shape> {
  name: string
  schema: Schema<S>
  database?: string
}

export interface CreateTableOptions<S extends Shape> {
  engine: TableEngine
  order_by: NonEmptyArray<keyof S> // TODO: functions support
  if_not_exists?: boolean
  or_replace?: boolean
  on_cluster?: string
  partition_by?: NonEmptyArray<keyof S> // TODO: functions support
  primary_key?: NonEmptyArray<keyof S> // TODO: functions support
  settings?: MergeTreeSettings
  pretty?: boolean
  // TODO: settings now moved to engines; decide whether we need it here
  // TODO: index
  // TODO: projections
  // TODO: TTL
  // TODO: comment
  // see https://clickhouse.com/docs/en/sql-reference/statements/create/table#with-explicit-schema
}

export interface SelectOptions<S extends Shape> {
  columns?: NonEmptyArray<keyof S>
  where?: WhereExpr<S>
  order_by?: NonEmptyArray<[keyof S, 'ASC' | 'DESC']>
  clickhouse_settings?: ClickHouseSettings
}

// export interface InsertOptions<S extends Shape> {
//   values: Infer<S>[]
//   clickhouse_settings?: ClickHouseSettings
// }

export class Table<S extends Shape> {
  constructor(private readonly options: TableOptions<S>) {}

  /** Alias for {@link ddl} */
  toString(options: CreateTableOptions<S>): string {
    return this.ddl(options)
  }

  // TODO: better types
  // TODO: options to constructor?
  ddl(options: CreateTableOptions<S>): string {
    const createTableOptions = { ...this.options, ...options }
    return QueryFormatter.createTable(createTableOptions)
  }

  // TODO: generate insert statement
  // see https://github.com/ClickHouse/clickhouse-js/blob/0c73398d24463ddcdd61e977c136b10dab5fe300/packages/client-common/src/client.ts#L278-L294
  // insert(
  //   {
  //     // clickhouse_settings,
  //     // values,
  //   }: InsertOptions<S>,
  // ): string {
  //   throw new Error('Not implemented')
  //   // return QueryFormatter.insert(this.options, values, clickhouse_settings)
  // }

  select({
    // clickhouse_settings, TODO: support settings
    columns,
    order_by,
    where,
  }: SelectOptions<S> = {}): string {
    return QueryFormatter.select(this.options, where, columns, order_by)
  }
}
