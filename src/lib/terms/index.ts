import { getGroupsTerms } from "./groups";
import { getMedicationsTerms } from "./medications";
import { getPathwaysTerms } from "./pathways";
import { getProceduresTerms } from "./procedures";
import { getRolesTerms } from "./roles";
import { getSymptomsTerms } from "./symptoms";

import type { Session } from "neo4j-driver";

export type TermItem = {
  value: string;
  label: string;
};

export const termFetchers: Record<
  string,
  (session: Session) => Promise<TermItem[]>
> = {
  groups: getGroupsTerms,
  medications: getMedicationsTerms,
  pathways: getPathwaysTerms,
  procedures: getProceduresTerms,
  roles: getRolesTerms,
  symptoms: getSymptomsTerms,
};
