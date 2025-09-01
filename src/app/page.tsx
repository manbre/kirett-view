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

        {/* Content unterhalb der Tabs verteilt die Höhe exakt */}
        <div
          className={[
            "mt-2 min-h-0 grow",
            "flex flex-col items-stretch gap-2 md:flex-row",
            "overflow-hidden", // globales Scrollen aus; nur Terms dürfen scrollen
          ].join(" ")}
        >
          {selectedCategory && (
            <aside className="flex min-h-0 shrink-0 flex-col gap-2 md:w-60">
              <h2 className="sr-only">Begriffe</h2>
              {/* Nur Terms scrollen */}
              <div className="min-h-0 flex-1 overflow-auto">
                <TermField selectedCategory={selectedCategory} />
              </div>
            </aside>
          )}

          {/* Graph + Toolbar nebeneinander, gleiche Höhe */}
          <section
            className={[
              "min-h-0 min-w-0 flex-1",
              "flex flex-col items-stretch gap-2 md:flex-row",
              "overflow-visible", // <— WICHTIG: NICHT hidden, damit Toolbar nach rechts wachsen darf
            ].join(" ")}
          >
            {/* Toolbar: mobil oben; desktop rechts. Keine feste Breite. Volle Höhe. */}
            <ToolBar className="order-first w-full md:order-last md:h-full md:w-auto md:flex-none md:shrink-0" />

            {/* Graph gibt Platz ab, wenn Toolbar wächst */}
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <GraphViewer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
