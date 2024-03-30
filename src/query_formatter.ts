import type { NonEmptyArray, Shape } from './common'
import type { WhereExpr } from './where'
import type { CreateTableOptions, TableOptions } from './table'

export type CreateTableFormatterOptions<S extends Shape> = TableOptions<S> &
  CreateTableOptions<S> & {
    pretty?: boolean
  }

export const QueryFormatter = {
  // See https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/#table_engine-mergetree-creating-a-table
  createTable: <S extends Shape>({
    pretty,
    schema,
    database,
    name,
    if_not_exists,
    or_replace,
    on_cluster,
    order_by,
    partition_by,
    primary_key,
    engine: _engine,
    settings: mergeTreeSettings,
  }: CreateTableFormatterOptions<S>): string => {
    const tableName = getTableName({
      database,
      name,
    })
    let result = 'CREATE'
    if (or_replace) {
      result += ' OR REPLACE TABLE'
    } else {
      result += ' TABLE'
    }
    if (if_not_exists) {
      result += ' IF NOT EXISTS'
    }
    result += ` ${tableName}`
    if (on_cluster) {
      result += ` ON CLUSTER '${on_cluster}'`
    }
    result += pretty ? '\n' : ' '
    result += `(${schema.toString({
      pretty,
    })})`
    result += pretty ? '\n' : ' '
    result += `ENGINE ${_engine}`
    result += pretty ? '\n' : ' '
    if (order_by) {
      result += `ORDER BY (${order_by.join(', ')})`
    }
    result += pretty ? '\n' : ' '
    if (partition_by) {
      result += `PARTITION BY (${partition_by.join(', ')})`
    }
    result += pretty ? '\n' : ' '
    if (primary_key) {
      result += `PRIMARY KEY (${primary_key.join(', ')})`
    }
    if (mergeTreeSettings && Object.keys(mergeTreeSettings).length) {
      const settings = Object.entries(mergeTreeSettings)
        .map(([key, value]) => {
          const v = typeof value === 'string' ? `'${value}'` : value
          return `${key} = ${v}`
        })
        .join(', ')
      result += pretty ? '\n' : ' '
      result += `SETTINGS ${settings}`
    }
    return result
  },

  // https://clickhouse.com/docs/en/sql-reference/statements/select/
  select: <S extends Shape>(
    tableOptions: TableOptions<S>,
    whereExpr?: WhereExpr<S>,
    columns?: NonEmptyArray<keyof S>,
    orderBy?: NonEmptyArray<[keyof S, 'ASC' | 'DESC']>,
    // pretty?: boolean,
  ) => {
    const tableName = getTableName(tableOptions)
    const where = whereExpr ? ` WHERE ${whereExpr.toString()}` : ''
    const cols = columns ? columns.join(', ') : '*'
    const order = orderBy
      ? ` ORDER BY ${orderBy
          .map(([column, order]) => `${column.toString()} ${order}`)
          .join(', ')}`
      : ''
    return `SELECT ${cols} FROM ${tableName}${where}${order}`
  },
}

export function getTableName<S extends Shape>({
  database,
  name,
}: Pick<TableOptions<S>, 'database' | 'name'>): string {
  return database !== undefined ? `\`${database}\`.\`${name}\`` : `\`${name}\``
}
