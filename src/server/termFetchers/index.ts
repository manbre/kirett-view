import { Category } from "@/constants/category";
import type { Session } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

import { getGroupTerms } from "./groups";
import { getMedicationTerms } from "./medications";
import { getPathwayTerms } from "./pathways";
import { getProcedureTerms } from "./procedures";
import { getRoleTerms } from "./roles";
import { getSymptomTerms } from "./symptoms";

// each fetcher takes a session and returns TermItem[]
export const termFetchers = {
  [Category.Groups]: (session: Session) => getGroupTerms(session),
  [Category.Medications]: (session: Session) => getMedicationTerms(session),
  [Category.Pathways]: (session: Session) => getPathwayTerms(session),
  [Category.Procedures]: (session: Session) => getProcedureTerms(session),
  [Category.Roles]: (session: Session) => getRoleTerms(session),
  [Category.Symptoms]: (session: Session) => getSymptomTerms(session),
} satisfies Record<Category, (session: Session) => Promise<TermItem[]>>;
