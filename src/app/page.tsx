"use client";

import { useState } from "react";
import { Category } from "@/constants/category";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TermField } from "@/components/TermField";
import { ToolBar } from "@/components/ToolBar";
import { GraphViewer } from "@/components/GraphViewer";
import Image from "next/image";
import { tokens } from "@/theme/tokens";
import { uiIconMap } from "@/constants/label";

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

              <button
                className="absolute top-2 left-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] hover:cursor-pointer hover:bg-[var(--color-mark)]/10 focus-visible:outline-2 focus-visible:outline-[var(--color-mark)]"
                aria-hidden
              >
                <span className="relative block h-6 w-6">
                  <Image
                    src={uiIconMap.Rewind} // "/icons/rewind.svg"
                    alt="zurück"
                    fill
                    color={tokens.node}
                    className="pointer-events-none object-contain"
                    priority
                  />
                </span>
              </button>

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
