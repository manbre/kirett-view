export enum Category {
  // Diseases = "diseases",
  Groups = "groups",
  Medications = "medications",
  Pathways = "pathways",
  Procedures = "procedures",
  Roles = "roles",
  Symptoms = "symptoms",
  Others = "others",
}

export const CategoryLabels: Record<Category, string> = {
  // [Category.Diseases]: "Krankheiten",
  [Category.Groups]: "Krankheitsgruppen",
  [Category.Medications]: "Medikamente",
  [Category.Pathways]: "BPR",
  [Category.Procedures]: "SAA",
  [Category.Roles]: "Rollen",
  [Category.Symptoms]: "Symptome",
  [Category.Others]: "Andere",
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
