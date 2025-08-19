"use client";

import { useState } from "react";
import { Category } from "@/constants/category";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";
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
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          {selectedCategory && (
            <aside
              aria-labelledby="terms-heading"
              className="shrink-0 overflow-hidden md:h-[calc(100dvh-4.5rem)] md:w-40 lg:w-60 xl:w-[15rem]"
            >
              <h2 id="terms-heading" className="sr-only">
                Begriffe
              </h2>
              <TermField selectedCategory={selectedCategory} />
            </aside>
          )}
          <section className="min-w-0 flex-1 flex-row md:h-[calc(100dvh-4.5rem)]">
            <GraphViewer />
          </section>
        </div>
      </main>
    </div>
  );
}
