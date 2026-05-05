import { Connector, AuthTypes, IpAddressTypes } from '@google-cloud/cloud-sql-connector'
import { Pool } from 'pg'

let poolPromise: Promise<Pool> | null = null

export function getPool(): Promise<Pool> {
  if (!poolPromise) {
    poolPromise = createPool().catch((err) => {
      poolPromise = null
      throw err
    })
  }
  return poolPromise
}

async function createPool(): Promise<Pool> {
  const instanceConnectionName = required('INSTANCE_CONNECTION_NAME')
  const user = required('DB_USER')
  const database = required('DB_NAME')

  const connector = new Connector()
  const clientOpts = await connector.getOptions({
    instanceConnectionName,
    authType: AuthTypes.IAM,
    ipType: IpAddressTypes.PUBLIC,
  })

  return new Pool({
    ...clientOpts,
    user,
    database,
    max: 5,
  })
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}
