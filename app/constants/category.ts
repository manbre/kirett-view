const folder = "terms";

export enum Category {
  Competence = `${folder}/competence`,
  // Actions = `${folder}/actions`,
  TreatmentPathways = `${folder}/treatment-pathways`,
  // InvasiveProcedures = `${folder}/invasive-procedures`,
  // Procedures = `${folder}/procedures`,
  Medication = `${folder}/medication`,
  StandardOperatingProcedures = `${folder}/standard-operating-procedures`,
}

export const CategoryLabels: Record<Category, string> = {
  [Category.Competence]: "Kompetenz",
  // [Category.Actions]: "Aktionen",
  [Category.Medication]: "Medikamente",
  // [Category.Procedures]: "Maßnahmen",
  // [Category.InvasiveProcedures]: "Invasive Maßnahmen",
  [Category.TreatmentPathways]: "Behandlungspfade",
  [Category.StandardOperatingProcedures]: "Standardarbeitsanweisungen",
};

export function createEmptySelectedTerms(): Record<Category, string[]> {
  return Object.values(Category).reduce(
    (acc, category) => {
      acc[category] = [];
      return acc;
    },
    {} as Record<Category, string[]>,
  );
}
