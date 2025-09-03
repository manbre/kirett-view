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

  function handleGraphAction() {
    console.log("Graph action clicked");
  }

  return (
    <div className="min-h-dvh">
      <main className="flex h-dvh w-[100dvw] flex-col overflow-hidden px-3 md:px-4">
        {/* Tabs dürfen nie schrumpfen */}
        <header className="relative z-10 shrink-0 overflow-visible">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
          />
        </header>

        {/* Bereich unterhalb der Tabs */}
        <div className="mt-1.5 mb-2 flex min-h-0 grow flex-col items-stretch gap-2 overflow-hidden md:flex-row">
          {selectedCategory && (
            <aside
              aria-labelledby="terms-heading"
              className="flex min-h-0 shrink-0 flex-col gap-2 md:w-55"
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
              "items-stretch md:flex-row",
            ].join(" ")}
          >
            {/* A: GraphViewer füllt den Rest */}
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              {/* Overlay-Button in der oberen rechten Ecke */}
              <div className="pointer-events-none absolute inset-0 z-20">
                <button
                  type="button"
                  onClick={handleGraphAction}
                  className="hover: pointer-events-auto absolute top-2 right-2 inline-flex cursor-pointer items-center justify-center rounded-md border border-[var(--color-border)] px-2 py-1 text-sm shadow hover:bg-[var(--color-mark)]/10 focus-visible:ring-2 focus-visible:ring-[var(--color-mark)]"
                  aria-label="Graph Aktion"
                  title="Graph Aktion"
                >
                  ✦
                </button>
              </div>

              {/* Graph selbst bleibt unter dem Button */}
              <GraphViewer />
            </div>

            {/* B: Toolbar */}
            <ToolBar className="order-first w-full md:order-last md:[width:max-content] md:flex-none md:self-stretch" />
          </section>
        </div>
      </main>
    </div>
  );
}
