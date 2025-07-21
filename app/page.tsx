"use client";

import GraphViewer from "@/components/GraphViewer";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";

export default function Home() {
  return (
    <div className="bg-back flex h-screen overflow-hidden">
      <div>
        <CategoryTabs />
        <main className="flex h-screen w-full">
          <TermField />

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
