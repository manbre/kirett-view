"use client";

import { type NodeLabel } from "@/constants/label";
import { Section } from "@/components/Section";

type Props = { className?: string };

// Deine drei Gruppen (Beispiel)
const group1: NodeLabel[] = [
  "StartNode",
  "DecisionNode",
  "DecisionNodeOR",
  "DecisionNodeYN",
  "ActionNode",
  "DisplayNode",
  "MedicationNode",
  "SAAMedicationNode",
  "ProcedureNode",
  "SAAProcedureNode",
  "InvasiveProcedureNode",
];
const group2: NodeLabel[] = ["MedicationNode", "StartNode"];
const group3: NodeLabel[] = ["BPRNode", "StopNode"];

export function ToolBar({ className = "" }: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Node-Icons"
      className={[
        "bg-fore rounded-xl border border-[var(--color-border)] p-2",
        "w-full", // mobil oben: volle Breite
        "md:h-full md:w-auto md:max-w-none md:flex-none md:shrink-0", // desktop: Höhe voll, Breite auto
        "overflow-visible", // <— WICHTIG: nie hidden, sonst Clips rechts
        className,
      ].join(" ")}
    >
      {/* verteilt Höhe auf 3 Sektionen; jede kennt ihre Höhe */}
      <div className="flex h-full min-h-0 flex-col gap-2">
        <Section keys={group1} className="md:h-full md:min-h-0 md:flex-[8]" />
        <div className="hidden border-t border-[var(--color-border)] md:block" />
        <Section keys={group2} className="md:h-full md:min-h-0 md:flex-[1]" />
        <div className="hidden border-t border-[var(--color-border)] md:block" />
        <Section keys={group3} className="md:h-full md:min-h-0 md:flex-[1]" />
      </div>
    </div>
  );
}
