"use client";

import { useState } from "react";
import { Category } from "@/constants/category";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";
import { GraphViewer } from "@/components/GraphViewer";
import { ToolBar } from "@/components/toolBar/ToolBar";

// Home page: category tabs, terms list, graph viewer and toolbar
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  return (
    <div className="min-h-dvh">
      <main className="flex h-dvh w-[100dvw] flex-col overflow-hidden px-3 md:px-4">
        <header className="relative z-10 shrink-0 overflow-visible">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onChangeCategory={setSelectedCategory}
          />
        </header>

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

          <section className="flex min-h-0 min-w-0 grow flex-col items-stretch gap-2 md:flex-row">
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              <GraphViewer />
            </div>
            <ToolBar className="w-full md:[width:max-content] md:flex-none md:self-stretch" />
          </section>
        </div>
      </main>
    </div>
  );
}
