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
        {/* Tabs: nie abschneiden */}
        <header className="relative z-10 shrink-0 overflow-visible">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
          />
        </header>

        {/* Bereich unter Tabs: verteilt Höhe exakt */}
        <div className="mt-2 flex min-h-0 grow flex-col items-stretch gap-2 overflow-hidden md:flex-row">
          {selectedCategory && (
            <aside className="flex min-h-0 shrink-0 flex-col gap-2 md:w-55">
              <h2 className="sr-only">Begriffe</h2>
              {/* Nur Term-Liste scrollt */}
              <div className="min-h-0 flex-1 overflow-auto">
                <TermField selectedCategory={selectedCategory} />
              </div>
            </aside>
          )}

          {/* Graph + Toolbar */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch gap-2 overflow-hidden md:grid md:grid-cols-[1fr_auto] md:gap-2">
            {/* Graph nimmt REST */}
            <div className="min-h-0 min-w-0 flex-1 basis-0 overflow-hidden md:col-[1] md:row-[1]">
              <GraphViewer />
            </div>

            {/* Toolbar: mobil oben (volle Breite), desktop rechts (Spalte auto) */}
            <ToolBar className="order-first w-full md:order-none md:col-[2] md:row-[1] md:h-full md:w-auto md:flex-none md:shrink-0" />
          </section>
        </div>
      </main>
    </div>
  );
}
