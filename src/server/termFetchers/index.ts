import { Category } from "@/constants/category";
import type { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

import { getGroupTerms } from "./groups";
import { getMedicationTerms } from "./medications";
import { getPathwayTerms } from "./pathways";
import { getProcedureTerms } from "./procedures";
import { getRoleTerms } from "./roles";
import { getSymptomTerms } from "./symptoms";
import { getOtherTerms } from "./others";

// each fetcher returns TermItem[]
export const termFetchers = {
  [Category.Groups]: (tx: Transaction) => getGroupTerms(tx),
  [Category.Medications]: (tx: Transaction) => getMedicationTerms(tx),
  [Category.Pathways]: (tx: Transaction) => getPathwayTerms(tx),
  [Category.Procedures]: (tx: Transaction) => getProcedureTerms(tx),
  [Category.Roles]: (tx: Transaction) => getRoleTerms(tx),
  [Category.Symptoms]: (tx: Transaction) => getSymptomTerms(tx),
  [Category.Others]: (tx: Transaction) => getOtherTerms(tx),
} satisfies Record<Category, (tx: Transaction) => Promise<TermItem[]>>;
