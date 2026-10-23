"use client";

// Client component that shares state between the product section and the chat.
// page.js (a server component) wraps both sections in it, so the static markup
// around them still renders on the server; only the parts that read this
// context ship JavaScript.

import { createContext, useCallback, useContext } from "react";
import { useSelectedProducts, writeSelectedIds } from "@/lib/selectionStore";

const AdvisorContext = createContext(null);

export function useAdvisor() {
  return useContext(AdvisorContext);
}

export default function AdvisorProvider({ children }) {
  const selected = useSelectedProducts();

  const toggleProduct = useCallback(
    (id) => {
      const ids = selected.map((p) => p.id);
      writeSelectedIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    [selected]
  );

  const removeProduct = useCallback(
    (id) => writeSelectedIds(selected.map((p) => p.id).filter((x) => x !== id)),
    [selected]
  );

  const clearProducts = useCallback(() => writeSelectedIds([]), []);

  return (
    <AdvisorContext.Provider value={{ selected, toggleProduct, removeProduct, clearProducts }}>
      {children}
    </AdvisorContext.Provider>
  );
}
