"use client";

import { useState } from "react";
import GraphViewer from "@/components/GraphViewer";
import { Tabs } from "@/components/Tabs";
import { SelectBar } from "@/components/SelectBar";
import { createEmptySelectedTerms } from "@/constants/category";

export default function Home() {
  const [selectedTerms, setSelectedTerms] = useState(
    createEmptySelectedTerms(),
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const handleAddTerm = (category: Category, term: string) => {
    if (!term || !category) return; // safety
    setSelectedTerms((prev) => {
      // Wenn der Begriff bereits vorhanden ist → keine Änderung
      if (prev[category].includes(term)) {
        return prev;
      }

      return {
        ...prev,
        [category]: [...prev[category], term],
      };
    });
  };

  const handleRemoveTerm = (category: Category, term: string) => {
    setSelectedTerms((prev) => ({
      ...prev,
      [category]: prev[category].filter((t) => t !== term),
    }));
  };

  return (
    <div className="bg-back flex h-screen overflow-hidden">
      <div>
        {/* <Tabs /> */}
        <Tabs
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <main className="flex h-screen w-full">
          {/**graph visualization*/}

          <SelectBar
            selectedCategory={selectedCategory}
            onSelectedTerm={handleAddTerm}
            onRemoveTerm={handleRemoveTerm}
            selectedTerms={
              selectedCategory ? selectedTerms[selectedCategory] : []
            }
          />

          {/**query result*/}
          <GraphViewer />

          <section>
            {/**map over similarities*/}
            <section></section>
          </section>
        </main>
      </div>
    </div>
  );
}
