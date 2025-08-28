"use client";

import { useState } from "react";
import { Category } from "@/constants/category";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";
import { ToolBar } from "@/components/ToolBar";
import { GraphViewer } from "@/components/GraphViewer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  return (
    <div className="bg-back min-h-dvh">
      <main className="flex h-dvh w-[100dvw] flex-col overflow-hidden px-2 py-2">
        <CategoryTabs
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />

        <div className="mt-2 flex min-h-0 grow flex-col gap-2 md:flex-row">
          {selectedCategory && (
            <aside
              aria-labelledby="terms-heading"
              className="flex min-h-0 shrink-0 flex-col gap-2 overflow-hidden md:w-50"
            >
              <h2 id="terms-heading" className="sr-only">
                Begriffe
              </h2>
              <TermField selectedCategory={selectedCategory} />
            </aside>
          )}

          {/* Rechts: Toolbar + Graph */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 md:flex-row">
            {/* MOBIL: Toolbar oben, Bereiche nebeneinander & wachsen nach unten
               DESKTOP: Toolbar rechts, kompakt (fixe Breite) */}
            <ToolBar
              onSelectLabel={(label) => setSelectedNode(label)}
              className="order-first md:order-last md:w-20" /* md:w-40 ≈ 10rem kompakt */
            />

            {/* Graph füllt Rest */}
            <div className="min-h-[40dvh] flex-1 md:min-h-0">
              <GraphViewer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
