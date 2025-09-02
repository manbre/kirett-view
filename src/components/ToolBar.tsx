"use client";

import { type NodeLabel } from "@/constants/label";
import { Section } from "@/components/Section";

type Props = { onSelectLabel?: (label: NodeLabel) => void; className?: string };

// Beispiel-Gruppen – passe an
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

export function ToolBar({ onSelectLabel, className = "" }: Props) {
  return (
    <aside
      role="toolbar"
      aria-label="Node-Icons"
      className={[
        "bg-fore rounded-xl border border-[var(--color-border)] p-2",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-2 md:h-full md:min-h-0">
        {/* Section 1 */}
        <Section
          keys={group1}
          className="w-full md:h-0 md:min-h-0 md:flex-[8]"
          onSelect={onSelectLabel}
        />

        {/* Trenner nach Section 1 (nur Desktop sichtbar) */}
        <div className="border-t border-[var(--color-border)] md:mb-5" />

        {/* Section 2 + 3 nebeneinander mobil, untereinander desktop */}
        <div className="flex flex-row gap-2 md:h-0 md:min-h-0 md:flex-[4] md:flex-col md:gap-0">
          <Section
            keys={group2}
            className="flex-1 md:h-0 md:min-h-0 md:flex-[1]"
            onSelect={onSelectLabel}
          />

          {/* Trenner zwischen 2 und 3 nur auf Desktop */}
          <div className="hidden border-t border-[var(--color-border)] md:mb-5 md:block" />

          <Section
            keys={group3}
            className="flex-1 md:h-0 md:min-h-0 md:flex-[1]"
            onSelect={onSelectLabel}
          />
        </div>
      </div>
    </aside>
  );
}
