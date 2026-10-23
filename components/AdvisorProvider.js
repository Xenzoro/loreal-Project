"use client";

// Client component that shares state between the product section and the chat.
// page.js (a server component) wraps both sections in it, so the static markup
// around them still renders on the server; only the parts that read this
// context ship JavaScript.

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useSelectedProducts, writeSelectedIds } from "@/lib/selectionStore";
import { SYSTEM_PROMPT, WORKER_URL, buildRoutineRequest } from "@/lib/lori";

const AdvisorContext = createContext(null);

export function useAdvisor() {
  return useContext(AdvisorContext);
}

export default function AdvisorProvider({ children }) {
  const selected = useSelectedProducts();

  // What the chat window shows. Rendered as text by React, never as HTML.
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  // What the Worker receives. Only turns that got a real reply are kept, so a
  // failed or rate limited message isn't resent with every later request.
  const historyRef = useRef([{ role: "system", content: SYSTEM_PROMPT }]);
  // Set synchronously, so a fast double click can't start two requests.
  const sendingRef = useRef(false);

  const ask = useCallback(async (content, displayText) => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);

    const add = (message) => setMessages((list) => [...list, message]);
    const userTurn = { role: "user", content };
    add({ kind: "user", text: displayText });

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...historyRef.current, userTurn] }),
      });

      // Rate limited by the Worker: show its SYSTEM: message as is.
      if (response.status === 429) {
        const result = await response.json();
        add({ kind: "notice", text: result.message });
        return;
      }

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();
      const replyText = result?.choices?.[0]?.message?.content;
      if (typeof replyText !== "string") throw new Error("Unexpected response shape");

      historyRef.current = [
        ...historyRef.current,
        userTurn,
        { role: "assistant", content: replyText },
      ];
      add({ kind: "assistant", text: replyText });
    } catch (error) {
      console.error("Error:", error);
      add({ kind: "notice", text: "Something went wrong. Please try again." });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, []);

  const generateRoutine = useCallback(() => {
    if (selected.length === 0) return;
    ask(buildRoutineRequest(selected), "Routine request with selected products");
  }, [ask, selected]);

  const sendMessage = useCallback((text) => ask(text, text), [ask]);

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

  const value = {
    selected,
    toggleProduct,
    removeProduct,
    clearProducts,
    messages,
    sending,
    sendMessage,
    generateRoutine,
  };

  return <AdvisorContext.Provider value={value}>{children}</AdvisorContext.Provider>;
}
