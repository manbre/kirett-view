import "server-only";
// Neo4j driver setup and helpers for read-only transactions.
// Caches a single driver instance across hot-reloads and exposes
// a withReadTx helper to run safe read transactions.
import neo4j, { Driver, Session } from "neo4j-driver";

//prevent this file from creating a new driver while reloading
declare global {
  // eslint-disable-next-line no-var
  var __neo4jDriver: Driver | undefined;
}

// lazily create or return the cached neo4j driver
export function getDriver(): Driver {
  if (global.__neo4jDriver) return global.__neo4jDriver;

  const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;
  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
    throw new Error("missing NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD");
  }
  // pool options can be tuned if needed
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    { maxConnectionPoolSize: 50 },
  );
  global.__neo4jDriver = driver;
  return driver;
}

// open a read only session
export function getNeo4jReadSession(): Session {
  return getDriver().session({ defaultAccessMode: neo4j.session.READ });
}

// for connectivity checks, throws if the driver cannot connect to db
export async function verifyConnection(): Promise<void> {
  await getDriver().verifyConnectivity();
}

// v5: executeRead, v4: readTransaction
export async function withReadTx<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const session = getNeo4jReadSession();
  try {
    return await session.executeRead(fn);
  } finally {
    await session.close();
  }
}
