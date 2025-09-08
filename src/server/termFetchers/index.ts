import { Category } from "@/constants/category";
import type { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

import { getGroupTerms } from "./groups";
import { getDiseaseTerms } from "./diseases";
import { getMedicationTerms } from "./medications";
import { getPathwayTerms } from "./pathways";
import { getProcedureTerms } from "./procedures";
import { getRoleTerms } from "./roles";
import { getSymptomTerms } from "./symptoms";
import { getOtherTerms } from "./others";

export type TermFetcher = (tx: Transaction) => Promise<TermItem[]>; // each fetcher returns TermItem[]

export const termFetchers: Record<TermFetcher> = {
  [Category.Groups]: getGroupTerms,
  [Category.Diseases]: getDiseaseTerms,
  [Category.Medications]: getMedicationTerms,
  [Category.Pathways]: getPathwayTerms,
  [Category.Procedures]: getProcedureTerms,
  [Category.Roles]: getRoleTerms,
  [Category.Symptoms]: getSymptomTerms,
  [Category.Others]: getOtherTerms,
};
