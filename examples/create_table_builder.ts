import { ch } from '@clickhouse/schema'

void (() => {
  const ddlSimple = ch
    .CreateOrReplaceTable({
      database: 'default',
      name: 'users',
    })
    .OnCluster('cluster')
    .WithColumns(
      new ch.Schema({
        id: ch.UInt32,
        name: ch.String,
        age: ch.UInt8,
      }),
    )
    .Engine(ch.MergeTree())
    .PartitionBy(['id'])
    .OrderBy(['id'])

  const line = '------------------'

  console.log('DDL Simple (compact)\n', line)
  console.log(ddlSimple.toString(), '\n')

  console.log('DDL Simple (pretty)\n', line)
  console.log(ddlSimple.toString(true), '\n')

  const ddlOnCluster = ch
    .CreateTable({
      database: 'default',
      name: 'users',
    })
    .IfNotExists()
    .OnCluster('cluster')
    .WithColumns(
      new ch.Schema({
        id: ch.UInt32,
        name: ch.String,
        age: ch.UInt8,
      }),
    )
    .Engine(ch.MergeTree())
    .PartitionBy(['id'])
    .OrderBy(['id'])

  console.log('DDL On Cluster (compact)\n', line)
  console.log(ddlOnCluster.toString(), '\n')

  console.log('DDL On Cluster (pretty)\n', line)
  console.log(ddlOnCluster.toString(true), '\n')
})()
