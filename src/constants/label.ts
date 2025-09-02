// graph node icons
export const labelIconMap = {
  ActionNode: "/icons/action.svg",
  BPRNode: "/icons/bpr.svg",
  DecisionNode: "/icons/descision.svg",
  DecisionNodeOR: "/icons/descisionOR.svg",
  DecisionNodeYN: "/icons/descisionYN.svg",
  DisplayNode: "/icons/display.svg",
  InvasiveProcedureNode: "/icons/invasive.svg",
  JumpNode: "/icons/jump.svg",
  MedicationNode: "/icons/dosage.svg",
  ProcedureNode: "/icons/procedure.svg",
  SAAMedicationNode: "/icons/medication.svg",
  SAAProcedureNode: "/icons/saa.svg",
  StartNode: "/icons/start.svg",
  StopNode: "/icons/stop.svg",
  WarningNode: "/icons/warning.svg",
  //
} as const;

export type NodeLabel = keyof typeof labelIconMap;

//============================================================
//
export const filterIconMap = {
  HopOne: "/icons/hop1.svg",
  HopTwo: "/icons/hop2.svg",
  OnlyEdges: "/icons/polygon.svg",
} as const;

export type FilterLabel = keyof typeof filterIconMap;

//============================================================
//
export const exportIconMap = {
  PngExport: "/icons/png.svg",
  SvgExport: "/icons/svg.svg",
} as const;

export type exportLabel = keyof typeof exportIconMap;
