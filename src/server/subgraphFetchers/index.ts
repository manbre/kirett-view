import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { Category } from "@/constants/category";

import { getGroupsSubgraph } from "./groups";
import { getDiseasesSubgraph } from "./diseases";
import { getMedicationsSubgraph } from "./medications";
import { getPathwaysSubgraph } from "./pathways";
import { getProceduresSubgraph } from "./procedures";
import { getRolesSubgraph } from "./roles";
import { getSymptomsSubgraph } from "./symptoms";
import { getOthersSubgraph } from "./others";

//
// registry of subgraph fetchers per category
export type SubgraphFetcher = (
  terms: string[],
  tx: Transaction,
  depth: ("1" | "2")[], // hop selection
  include: string[], // type selection
) => Promise<Neo4jRecord[]>;

export const subgraphFetchers: Record<Category, SubgraphFetcher> = {
  [Category.Groups]: getGroupsSubgraph,
  [Category.Diseases]: getDiseasesSubgraph,
  [Category.Medications]: getMedicationsSubgraph,
  [Category.Pathways]: getPathwaysSubgraph,
  [Category.Procedures]: getProceduresSubgraph,
  [Category.Roles]: getRolesSubgraph,
  [Category.Symptoms]: getSymptomsSubgraph,
  [Category.Others]: getOthersSubgraph,
};
