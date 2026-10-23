"use client";

import { products } from "@/lib/products";
import { useAdvisor } from "./AdvisorProvider";
import ProductCard from "./ProductCard";

// Prerendered at build time, so all 8 cards are in the HTML before any
// JavaScript runs. That's what removes the old layout shift.
export default function ProductGrid() {
  const { selected, toggleProduct } = useAdvisor();

  return (
    <div id="productGrid" className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selected={selected.some((p) => p.id === product.id)}
          onToggle={toggleProduct}
        />
      ))}
    </div>
  );
}
