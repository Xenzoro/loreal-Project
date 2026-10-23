"use client";

// Selected product ids, kept in localStorage under the same key as the old
// script.js so saved selections carry over.
//
// useSyncExternalStore lets React read an outside value (localStorage) safely:
// during the build there's no localStorage, so getServerSnapshot returns "[]",
// and React switches to the real value right after the page hydrates.

import { useMemo, useSyncExternalStore } from "react";
import { products } from "./products";

const KEY = "selectedProductIds";
const listeners = new Set();
// In memory copy, so selection still works if storage is blocked.
let current = null;

function read() {
  if (current === null) {
    try {
      current = localStorage.getItem(KEY) ?? "[]";
    } catch {
      current = "[]";
    }
  }
  return current;
}

function onStorage(event) {
  if (event.key !== KEY && event.key !== null) return;
  current = null;
  listeners.forEach((callback) => callback());
}

function subscribe(callback) {
  listeners.add(callback);
  // Also stay in sync when the selection changes in another tab.
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function writeSelectedIds(ids) {
  current = JSON.stringify(ids);
  try {
    if (ids.length) localStorage.setItem(KEY, JSON.stringify(ids));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the in memory copy keeps selection working for this visit.
  }
  listeners.forEach((callback) => callback());
}

export function useSelectedProducts() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  return useMemo(() => {
    let ids;
    try {
      ids = JSON.parse(raw);
    } catch {
      ids = [];
    }
    if (!Array.isArray(ids)) ids = [];
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  }, [raw]);
}
