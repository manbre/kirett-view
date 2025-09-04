import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { Category } from "@/constants/category";

import { getGroupsSubgraph } from "./groups";
import { getMedicationsSubgraph } from "./medications";
import { getPathwaysSubgraph } from "./pathways";
import { getProceduresSubgraph } from "./procedures";
import { getRolesSubgraph } from "./roles";
import { getSymptomsSubgraph } from "./symptoms";
import { getOthersSubgraph } from "./others";

export type SubgraphFetcher = (
  terms: string[],
  tx: Transaction,
  depth: ("1" | "2")[], // hop selection
  include: string[], // type selection
) => Promise<Neo4jRecord[]>;

export const subgraphFetchers: Record<Category, SubgraphFetcher> = {
  [Category.Groups]: getGroupsSubgraph,
  [Category.Medications]: getMedicationsSubgraph,
  [Category.Pathways]: getPathwaysSubgraph,
  [Category.Procedures]: getProceduresSubgraph,
  [Category.Symptoms]: getSymptomsSubgraph,
  //
  [Category.Roles]: ((terms, tx, include) =>
    getRolesSubgraph(terms, tx, include)) as SubgraphFetcher,
  //
  [Category.Others]: ((terms, tx) =>
    getOthersSubgraph(terms, tx)) as SubgraphFetcher,
};
