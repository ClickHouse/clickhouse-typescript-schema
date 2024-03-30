import type * as common from './common'
import * as schema from './schema'
import * as types from './types'
import * as table from './table'
import * as engines from './engines'
import * as where from './where'

export namespace ch {
  export type Infer<S extends common.Shape> = common.Infer<S>

  export const Schema = schema.Schema
  export const createSchema = schema.createSchema

  export const Table = table.Table
  export type TableOptions<S extends common.Shape> = table.TableOptions<S>
  export type CreateTableOptions<S extends common.Shape> =
    table.CreateTableOptions<S>

  export type TableEngine = engines.TableEngine
  export const MergeTree = engines.MergeTree
  export const ReplicatedMergeTree = engines.ReplicatedMergeTree
  export const ReplacingMergeTree = engines.ReplacingMergeTree
  export const SummingMergeTree = engines.SummingMergeTree
  export const AggregatingMergeTree = engines.AggregatingMergeTree
  export const CollapsingMergeTree = engines.CollapsingMergeTree
  export const VersionedCollapsingMergeTree =
    engines.VersionedCollapsingMergeTree
  export const GraphiteMergeTree = engines.GraphiteMergeTree

  export const Bool = types.Bool
  export const Int8 = types.Int8
  export const Int16 = types.Int16
  export const Int32 = types.Int32
  export const Int64 = types.Int64
  export const UInt8 = types.UInt8
  export const UInt16 = types.UInt16
  export const UInt32 = types.UInt32
  export const UInt64 = types.UInt64
  export const Float32 = types.Float32
  export const Float64 = types.Float64
  export const String = types.String
  export const FixedString = types.FixedString
  export const UUID = types.UUID
  export const IPv4 = types.IPv4
  export const IPv6 = types.IPv6
  export const Date = types.Date
  export const Date32 = types.Date32
  export const DateTime = types.DateTime
  export const DateTime64 = types.DateTime64
  export const LowCardinality = types.LowCardinality
  export const Nullable = types.Nullable
  export const Array = types.Array
  export const Enum = types.Enum
  export const Map = types.Map

  export const Eq = where.Eq
  export const And = where.And
  export const Or = where.Or
}
