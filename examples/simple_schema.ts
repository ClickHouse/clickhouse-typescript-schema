import { ch } from '@clickhouse/schema'
import Eq = ch.Eq
import And = ch.And

void (async () => {
  enum UserRole {
    User = 'User',
    Admin = 'Admin',
  }

  const userSchema = ch.createSchema({
    id: ch.UInt32,
    f64: ch.Float64,
    name: ch.String,
    tuple3: ch.Tuple(ch.UInt32, ch.String, ch.Array(ch.String)),
    balance: ch.Decimal({
      precision: 10,
      scale: 4,
    }),
    assignments: ch.Array(ch.Nullable(ch.String)),
    arrays_of_int64: ch.Array(ch.Array(ch.UInt64)),
    settings: ch.Map(ch.String, ch.UInt32),
    role: ch.Enum(UserRole),
    registered_at: ch.DateTime64(3, 'Europe/Amsterdam'),
  })

  type Data = ch.Infer<typeof userSchema.shape>

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
      columns: ['id', 'name', 'registered_at'], // or omit to select *
      order_by: [['name', 'DESC']],
      where: And(Eq('role', UserRole.Admin), Eq('id', 42)),
    }),
  )
})()
