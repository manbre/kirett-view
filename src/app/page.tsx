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
      <main className="flex h-dvh w-[100dvw] flex-col overflow-hidden px-3 md:px-4">
        {/* Tabs dürfen nie schrumpfen */}
        <header className="relative z-10 shrink-0 overflow-visible">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
          />
        </header>

        {/* Bereich unterhalb der Tabs */}
        <div className="mt-2 flex min-h-0 grow flex-col items-stretch gap-2 overflow-hidden md:flex-row">
          {selectedCategory && (
            <aside
              aria-labelledby="terms-heading"
              className="flex min-h-0 shrink-0 flex-col gap-2 md:w-60"
            >
              <h2 id="terms-heading" className="sr-only">
                Begriffe
              </h2>
              <div className="min-h-0 flex-1 overflow-auto">
                <TermField selectedCategory={selectedCategory} />
              </div>
            </aside>
          )}

          {/* === Graph + Toolbar als Grid ================================== */}
          <section
            className={[
              "grid gap-2",
              // Erste Spalte: minmax(24rem, 1fr) → Graph
              // Zweite Spalte: fit-content(70vw) → Toolbar
              "md:[grid-template-columns:minmax(24rem,1fr)_max-content]",
            ].join(" ")}
          >
            {/* Graph nimmt IMMER den Rest; bekommt echte Höhe */}
            <div className="h-full min-h-0 min-w-0 md:col-[1] md:row-[1]">
              {/* [WICHTIG] Parent hat min-h-0 + Grid → h-full wirkt */}
              <GraphViewer />
            </div>

            {/* Toolbar rechts; Breite bestimmt sich durch Spalten der Sections */}
            <ToolBar
              className={[
                "order-first w-full", // mobil
                "md:order-none md:col-[2] md:row-[1] md:h-full",
                "md:[align-self:start] md:[justify-self:start]",
                "md:inline-block md:[width:max-content] md:min-w-0 md:flex-none md:shrink-0",
              ].join(" ")}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
