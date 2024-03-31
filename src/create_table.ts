import type { Schema } from './schema'
import type { NonEmptyArray, Shape } from './common'
import type { TableEngine } from './engines'
import type { CreateTableFormatterOptions } from './query_formatter'
import { QueryFormatter } from './query_formatter'

type CreateTableInitialState = {
  or_replace: boolean
  database: string
  name: string
  type: 'Name'
}
type CreateTableIfNotExistsState = Omit<CreateTableInitialState, 'type'> & {
  if_not_exists?: boolean
  type: 'IfNotExists'
}
type CreateTableOnClusterState = Omit<CreateTableIfNotExistsState, 'type'> & {
  on_cluster?: string
  type: 'OnCluster'
}
type CreateTableSchemaState<S extends Shape> = Omit<
  CreateTableIfNotExistsState,
  'type'
> & {
  schema: Schema<S>
  type: 'Schema'
}
type CreateTableWithEngineState<S extends Shape> = Omit<
  CreateTableSchemaState<S>,
  'type'
> & {
  engine: TableEngine
  type: 'Engine'
}
type CreateTablePartitionByState<S extends Shape> = Omit<
  CreateTableWithEngineState<S>,
  'type'
> & {
  partition_by?: NonEmptyArray<keyof S>
  type: 'PartitionBy'
}
type CreateTableOrderByState<S extends Shape> = Omit<
  CreateTablePartitionByState<S>,
  'type'
> & {
  order_by: NonEmptyArray<keyof S>
  type: 'OrderBy'
}

// TODO: add MergeTree settings
// type CreateTableMergeTreeSettingsState<S extends Shape> = Omit<
//   CreateTableOrderByState<S>,
//   'type'
// > & {
//   merge_tree_settings: MergeTreeSettings
//   type: 'MergeTreeSettings'
// }

type CreateTable = {
  IfNotExists: IfNotExists
  OnCluster: OnCluster['OnCluster']
  WithColumns: WithColumns['WithColumns']
}
type CreateOrReplaceTable = {
  OnCluster: OnCluster['OnCluster']
  WithColumns: WithColumns['WithColumns']
}
type IfNotExists = () => {
  OnCluster: OnCluster['OnCluster']
  WithColumns: WithColumns['WithColumns']
}
type OnCluster = {
  OnCluster: (cluster: string) => WithColumns
}
type WithColumns = {
  WithColumns: <S extends Shape>(schema: Schema<S>) => Engine<S>
}
type OrderBy<S extends Shape> = {
  OrderBy: (order_by: NonEmptyArray<keyof S>) => {
    ddl: (pretty?: boolean) => string
    toString: (pretty?: boolean) => string
  }
}
type PartitionOrOrderBy<S extends Shape> = {
  OrderBy: OrderBy<S>['OrderBy']
  PartitionBy: (partition_by: NonEmptyArray<keyof S>) => OrderBy<S>
}
type Engine<S extends Shape> = {
  Engine: (engine: TableEngine) => PartitionOrOrderBy<S>
}

function withOrderBy<S extends Shape>(
  previousState: CreateTablePartitionByState<S> | CreateTableWithEngineState<S>,
): OrderBy<S> {
  return {
    OrderBy: (order_by: NonEmptyArray<keyof S>) => {
      const orderByState: CreateTableOrderByState<S> = {
        ...previousState,
        order_by,
        type: 'OrderBy',
      }
      const ddl = (pretty?: boolean) => {
        const formatOptions: CreateTableFormatterOptions<S> = {
          ...orderByState,
          pretty,
        }
        return QueryFormatter.createTable(formatOptions)
      }
      return {
        ddl,
        toString: (pretty?: boolean) => ddl(pretty),
      }
    },
  }
}

function withPartitionBy<S extends Shape>(
  previousState: CreateTableWithEngineState<S>,
): PartitionOrOrderBy<S> {
  return {
    ...withOrderBy(previousState),
    PartitionBy: (partition_by: NonEmptyArray<keyof S>) => {
      const partitionByState: CreateTablePartitionByState<S> = {
        ...previousState,
        partition_by,
        type: 'PartitionBy',
      }
      return withOrderBy(partitionByState)
    },
  }
}

function withEngine<S extends Shape>(
  previousState: CreateTableSchemaState<S>,
): Engine<S> {
  return {
    Engine: (engine: TableEngine) => {
      const engineState: CreateTableWithEngineState<S> = {
        ...previousState,
        engine,
        type: 'Engine',
      }
      return withPartitionBy(engineState)
    },
  }
}

function withColumns(
  previousState:
    | CreateTableOnClusterState
    | CreateTableIfNotExistsState
    | CreateTableInitialState,
): WithColumns {
  return {
    WithColumns: <S extends Shape>(schema: Schema<S>) => {
      const schemaState: CreateTableSchemaState<S> = {
        ...previousState,
        schema,
        type: 'Schema',
      }
      return withEngine(schemaState)
    },
  }
}

function withOnCluster(
  previousState: CreateTableIfNotExistsState | CreateTableInitialState,
): OnCluster {
  return {
    OnCluster: (cluster: string) => {
      const onClusterState: CreateTableOnClusterState = {
        ...previousState,
        on_cluster: cluster,
        type: 'OnCluster',
      }
      return withColumns(onClusterState)
    },
  }
}

function withIfNotExists(initialState: CreateTableInitialState) {
  const ifNotExistsState: CreateTableIfNotExistsState = {
    ...initialState,
    if_not_exists: true,
    type: 'IfNotExists',
  }
  return {
    IfNotExists: () => ({
      ...withOnCluster(ifNotExistsState),
      ...withColumns(ifNotExistsState),
    }),
  }
}

export interface CreateTableOptions {
  database: string
  name: string
}

export function CreateOrReplaceTable(
  options: CreateTableOptions,
): CreateOrReplaceTable {
  const nameState: CreateTableInitialState = {
    type: 'Name',
    or_replace: true,
    ...options,
  }
  return {
    ...withColumns(nameState),
    ...withOnCluster(nameState),
  }
}

export function CreateTable(options: CreateTableOptions): CreateTable {
  const nameState: CreateTableInitialState = {
    type: 'Name',
    or_replace: false,
    ...options,
  }
  return {
    ...withColumns(nameState),
    ...withOnCluster(nameState),
    ...withIfNotExists(nameState),
  }
}
