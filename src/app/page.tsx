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

          {/* === Graph (A) + Toolbar (B) ================================== */}
          <section
            className={[
              "min-h-0 min-w-0 grow",
              "flex flex-col gap-2",
              "items-stretch md:flex-row", // A und B gleiche Höhe
            ].join(" ")}
          >
            {/* A: GraphViewer füllt immer den Rest */}
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <GraphViewer />
            </div>

            {/* B: ToolBar rechts, Breite = Inhalt, volle Höhe */}
            <ToolBar className="order-first w-full md:order-last md:[width:max-content] md:flex-none md:self-stretch" />
          </section>
        </div>
      </main>
    </div>
  );
}
