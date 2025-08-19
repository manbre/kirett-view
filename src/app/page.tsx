"use client";

import { useState } from "react";
import { Category } from "@/constants/category";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";
import { GraphViewer } from "@/components/GraphViewer";
import { InfoPanel } from "@/components/InfoPanel";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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
              className="/* etwas breiter auf großen Screens */ /* erlaubt kindern korrekt zu wachsen/schrumpfen */ flex min-h-0 shrink-0 flex-col gap-2 overflow-hidden md:h-[calc(100dvh-4.5rem)] md:w-40 lg:w-60 xl:w-[15rem] 2xl:w-[20rem]" /* [LAYOUT] */
            >
              <h2 id="terms-heading" className="sr-only">
                Begriffe
              </h2>

              <div className="min-h-0 flex-1">
                <TermField selectedCategory={selectedCategory} />
              </div>

              <div className="hidden shrink-0 md:block">
                <div className="h-40 md:h-50 lg:h-50 xl:h-64">
                  <InfoPanel selectedNode={selectedNode} />
                </div>
              </div>
            </aside>
          )}
          <section className="min-h-0 min-w-0 flex-1 md:h-[calc(100dvh-4.5rem)]">
            <GraphViewer onChangeNode={setSelectedNode} />
          </section>
        </div>
      </main>
    </div>
  );
}
