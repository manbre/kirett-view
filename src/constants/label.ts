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
} as const;

export type NodeLabel = keyof typeof labelIconMap;

// action icons
export const actionIconMap = {
  PngAction: "/icons/png.svg",
  SvgAction: "/icons/svg.svg",
  EdgeAction: "/icons/polygon.svg",
} as const;

export type ActionLabel = keyof typeof actionIconMap;
