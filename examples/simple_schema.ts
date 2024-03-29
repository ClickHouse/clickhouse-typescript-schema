import * as ch from '../src'
import type { Infer } from '../src'
import { createSchema } from '../src'

void (async () => {
  enum UserRole {
    User = 'User',
    Admin = 'Admin',
  }
  const userSchema = createSchema({
    id: ch.UInt64,
    f64: ch.Float64,
    name: ch.String,
    maybeNullable: ch.Array(ch.Nullable(ch.String)),
    externalIds: ch.Array(ch.Array(ch.UInt64)),
    settings: ch.Map(ch.String, ch.String),
    role: ch.Enum(UserRole),
    registeredAt: ch.DateTime64(3, 'Europe/Amsterdam'),
  })

  type Data = Infer<typeof userSchema.shape>

  const usersTable = new ch.Table({
    name: 'users',
    schema: userSchema,
  })

  const line = '------------------'

  console.log('Generated table DDL examples')

  console.log('\nSingle node DDL (pretty)\n', line)
  console.log(
    usersTable.ddl({
      engine: ch.MergeTree(),
      order_by: ['id'],
    }),
  )

  console.log('\nSingle node DDL (pretty)\n', line)
  console.log(
    usersTable.ddl({
      engine: ch.MergeTree(),
      order_by: ['id'],
      pretty: true,
    }),
  )

  console.log('\nCluster DDL (compact)\n', line)
  console.log(
    usersTable.ddl({
      on_cluster: 'cluster',
      engine: ch.ReplicatedMergeTree({
        zoo_path: '/clickhouse/{cluster}/tables/{database}/{table}/{shard}',
        replica_name: '{replica}',
      }),
      order_by: ['id'],
    }),
  )

  console.log('\nCluster DDL (pretty)\n', line)
  console.log(
    usersTable.ddl({
      on_cluster: 'cluster',
      engine: ch.ReplicatedMergeTree({
        zoo_path: '/clickhouse/{cluster}/tables/{database}/{table}/{shard}',
        replica_name: '{replica}',
      }),
      order_by: ['id'],
      pretty: true,
    }),
  )

  console.log('Generated table Select examples\n', line)
  console.log(
    usersTable.select({
      columns: ['id', 'name', 'registeredAt'], // or omit to select *
      order_by: [['name', 'DESC']],
    }),
  )
})()
