import neo4j, { Driver, Session } from "neo4j-driver";

const uri: string = process.env.NEO4J_URI ?? "";
const user: string = process.env.NEO4J_USER ?? "";
const password: string = process.env.NEO4J_PASSWORD ?? "";

if (!uri || !user || !password) {
  throw new Error("missing neo4j environment variables");
}

const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export function getNeo4jSession(): Session {
  return driver.session({ defaultAccessMode: neo4j.session.READ });
}

export default driver;
