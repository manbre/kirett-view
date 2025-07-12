export enum Category {
  TreatmentPathways = "treatment-pathways",
  InvasiveProcedures = "invasive-procedures",
  Procedures = "procedures",
  Medication = "medication",
  StandardOperatingProcedures = "standard-operating-procedures",
}

export const CategoryLabels: Record<Category, string> = {
  [Category.Medication]: "Medikamente",
  [Category.Procedures]: "Maßnahmen",
  [Category.InvasiveProcedures]: "Invasive Maßnahmen",
  [Category.TreatmentPathways]: "Behandlungspfade",
  // [Category.StandardOperatingProcedures]: "Standardarbeitsanweisungen",
};

export function createEmptySelectedTerms(): Record<Category, string[]> {
  return Object.values(Category).reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {} as Record<Category, string[]>);
}
