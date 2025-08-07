export enum Category {
  Groups = "groups",
  Medications = "medications",
  Pathways = "pathways",
  Procedures = "procedures",
  Roles = "roles",
  Symptoms = "symptoms",
}

export const CategoryLabels: Record<Category, string> = {
  [Category.Groups]: "Krankheitsgruppen",
  [Category.Medications]: "Medikamente",
  [Category.Pathways]: "Behandlungspfade",
  [Category.Procedures]: "Standardarbeitsanweisungen",
  [Category.Roles]: "Rollen",
  [Category.Symptoms]: "Symptome",
};

export const createEmptySelectedTerms = (): Record<Category, string[]> => {
  return Object.values(Category).reduce(
    (acc, cat) => {
      acc[cat as Category] = [];
      return acc;
    },
    {} as Record<Category, string[]>,
  );
};
