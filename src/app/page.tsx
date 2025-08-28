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
      <main className="3xl:px-8 flex h-dvh w-[100dvw] max-w-none flex-col overflow-hidden px-3 md:px-4">
        <CategoryTabs
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />

        <div className="mt-2 flex min-h-0 grow flex-col gap-2 md:flex-row">
          {selectedCategory && (
            <aside
              aria-labelledby="terms-heading"
              className="flex min-h-0 shrink-0 flex-col gap-2 overflow-hidden md:h-[calc(100dvh-4.5rem)] md:w-50 lg:w-60 xl:w-[12rem] 2xl:w-[12rem]"
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
              className="order-first md:order-last md:w-25" /* md:w-40 ≈ 10rem kompakt */
            />

            {/* Graph füllt Rest */}
            <div className="min-h-0 min-w-0 flex-1 md:h-[calc(100dvh-4.5rem)]">
              <GraphViewer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
