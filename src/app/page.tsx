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
    <div className="bg-back flex h-screen overflow-hidden">
      <div>
        <CategoryTabs
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />
        <main className="flex h-screen w-full">
          {selectedCategory && (
            <TermField selectedCategory={selectedCategory} />
          )}

          {/**query result*/}
          {/* <GraphViewer /> */}

          <section>
            {/**map over similarities*/}
            <section></section>
          </section>
        </main>
      </div>
    </div>
  );
}
