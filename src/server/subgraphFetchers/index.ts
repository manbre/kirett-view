import { Category } from "@/constants/category";
import type { Session, Record as Neo4jRecord } from "neo4j-driver";

import { getGroupsSubgraph } from "./groups";
import { getMedicationsSubgraph } from "./medications";
import { getPathwaysSubgraph } from "./pathways";
import { getProceduresSubgraph } from "./procedures";
import { getRolesSubgraph } from "./roles";
import { getSymptomsSubgraph } from "./symptoms";

// each fetcher returns neo4j records, the route converts once at the end
export const subgraphFetchers = {
  [Category.Groups]: (terms: string[], session: Session) =>
    getGroupsSubgraph(terms, session),
  [Category.Medications]: (terms: string[], session: Session) =>
    getMedicationsSubgraph(terms, session),
  [Category.Pathways]: (terms: string[], session: Session) =>
    getPathwaysSubgraph(terms, session),
  [Category.Procedures]: (terms: string[], session: Session) =>
    getProceduresSubgraph(terms, session),
  [Category.Roles]: (terms: string[], session: Session) =>
    getRolesSubgraph(terms, session),
  [Category.Symptoms]: (terms: string[], session: Session) =>
    getSymptomsSubgraph(terms, session),
} satisfies Record<
  Category,
  (terms: string[], session: Session) => Promise<Neo4jRecord[]>
>;
