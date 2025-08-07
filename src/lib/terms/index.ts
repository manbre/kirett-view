import { getGroupTerms } from "./groups";
import { getMedicationTerms } from "./medications";
import { getPathwayTerms } from "./pathways";
import { getProcedureTerms } from "./procedures";
import { getRoleTerms } from "./roles";
import { getSymptomTerms } from "./symptoms";

import type { Session } from "neo4j-driver";

export type TermItem = {
  value: string;
  label: string;
};

export const termFetchers: Record<
  string,
  (session: Session) => Promise<TermItem[]>
> = {
  groups: getGroupTerms,
  medications: getMedicationTerms,
  pathways: getPathwayTerms,
  procedures: getProcedureTerms,
  roles: getRoleTerms,
  symptoms: getSymptomTerms,
};
