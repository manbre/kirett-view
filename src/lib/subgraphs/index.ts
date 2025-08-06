import { getGroupsSubgraph } from "./groups";
import { getMedicationsSubgraph } from "./medications";
import { getPathwaysSubgraph } from "./pathways";
import { getProceduresSubgraph } from "./procedures";
import { getRolesSubgraph } from "./roles";
import { getSymptomsSubgraph } from "./symptoms";

import type { Session } from "neo4j-driver";
import type { SubgraphResult } from "@/types/graph";

export const subgraphFetchers: Record<
  string,
  (terms: string[], session: Session) => Promise<SubgraphResult>
> = {
  groups: getGroupsSubgraph,
  medications: getMedicationsSubgraph,
  pathways: getPathwaysSubgraph,
  procedures: getProceduresSubgraph,
  roles: getRolesSubgraph,
  symptoms: getSymptomsSubgraph,
};
