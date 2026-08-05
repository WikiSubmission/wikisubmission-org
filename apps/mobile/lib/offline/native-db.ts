import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'

/**
 * Shared @capacitor-community/sqlite connection manager for the native offline
 * stores. One SQLiteConnection wraps the plugin; individual databases (one per
 * content bundle, one per signed-in user) are opened lazily and cached.
 *
 * Native only. These modules are registered behind Capacitor.isNativePlatform()
 * (see register-offline-mobile.ts), so the plugin is never invoked in the web
 * dev preview of the mobile app.
 */
let connection: SQLiteConnection | null = null

export function sqlite(): SQLiteConnection {
  if (!connection) connection = new SQLiteConnection(CapacitorSQLite)
  return connection
}

/**
 * Open (or retrieve) a database connection by name. Content bundles open
 * read-only; the user mirror opens read-write. Idempotent: a second call for the
 * same (name, readonly) returns the existing open connection.
 */
export async function openDb(name: string, readonly: boolean): Promise<SQLiteDBConnection> {
  const s = sqlite()
  const exists = (await s.isConnection(name, readonly)).result === true
  const db = exists
    ? await s.retrieveConnection(name, readonly)
    : await s.createConnection(name, false, 'no-encryption', 1, readonly)
  if ((await db.isDBOpen()).result !== true) await db.open()
  return db
}

/** Close a connection if it is currently open. Safe to call when absent. */
export async function closeDb(name: string, readonly: boolean): Promise<void> {
  const s = sqlite()
  if ((await s.isConnection(name, readonly)).result === true) {
    await s.closeConnection(name, readonly)
  }
}

/** Rows from a SELECT as plain objects keyed by column name. */
export async function query(
  db: SQLiteDBConnection,
  sql: string,
  values: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  const res = await db.query(sql, values as never[])
  return (res.values ?? []) as Record<string, unknown>[]
}
