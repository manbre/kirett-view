import { Category } from "@/constants/category";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

import { getGroupsSubgraph } from "./groups";
import { getMedicationsSubgraph } from "./medications";
import { getPathwaysSubgraph } from "./pathways";
import { getProceduresSubgraph } from "./procedures";
import { getRolesSubgraph } from "./roles";
import { getSymptomsSubgraph } from "./symptoms";
import { getOthersSubgraph } from "./others";

// each fetcher returns neo4j records, the route converts once at the end
export const subgraphFetchers = {
  [Category.Groups]: (terms: string[], tx: Transaction) =>
    getGroupsSubgraph(terms, tx),
  [Category.Medications]: (terms: string[], tx: Transaction) =>
    getMedicationsSubgraph(terms, tx),
  [Category.Pathways]: (terms: string[], tx: Transaction) =>
    getPathwaysSubgraph(terms, tx),
  [Category.Procedures]: (terms: string[], tx: Transaction) =>
    getProceduresSubgraph(terms, tx),
  [Category.Roles]: (terms: string[], tx: Transaction) =>
    getRolesSubgraph(terms, tx),
  [Category.Symptoms]: (terms: string[], tx: Transaction) =>
    getSymptomsSubgraph(terms, tx),
  [Category.Others]: (terms: string[], tx: Transaction) =>
    getOthersSubgraph(terms, tx),
} satisfies Record<
  Category,
  (terms: string[], tx: Transaction) => Promise<Neo4jRecord[]>
>;
