"use client";

import { type NodeLabel } from "@/constants/label";
import { Section } from "@/components/Section";

type Props = {
  onSelectLabel?: (label: NodeLabel) => void;
  className?: string;
};

const group1: NodeLabel[] = [
  "StartNode",
  "DecisionNode",
  "DecisionNodeOR",
  "DecisionNodeYN",
  "ActionNode",
  "DisplayNode",
];
const group2: NodeLabel[] = [
  "MedicationNode",
  "SAAMedicationNode",
  "ProcedureNode",
  "SAAProcedureNode",
  "InvasiveProcedureNode",
];
const group3: NodeLabel[] = ["BPRNode", "JumpNode", "WarningNode", "StopNode"];

export function ToolBar({ onSelectLabel, className = "" }: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Node-Icons"
      className={[
        "bg-fore rounded-xl border border-[var(--border)] p-2",
        "flex flex-row gap-2",
        "md:w-25 md:max-w-[12rem] md:flex-col",
        className,
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <Section keys={group1} onSelect={onSelectLabel} />
      </div>
      <div className="border-l border-[var(--border)] md:border-t md:border-l-0" />
      <div className="min-w-0 flex-1">
        <Section keys={group2} onSelect={onSelectLabel} />
      </div>
      <div className="border-l border-[var(--border)] md:border-t md:border-l-0" />
      <div className="min-w-0 flex-1">
        <Section keys={group3} onSelect={onSelectLabel} />
      </div>
    </div>
  );
}
