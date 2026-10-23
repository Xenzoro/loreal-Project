"use client";

import { useState } from "react";
import { MdExpandMore } from "react-icons/md";

export default function ProductCard({ product, selected, onToggle }) {
  // Each card owns its open/closed state, so selecting a product no longer
  // collapses every open description (the old code rebuilt all cards).
  const [expanded, setExpanded] = useState(false);
  const titleId = `product-${product.id}-title`;
  const descriptionId = `product-${product.id}-description`;

  function handleCardClick(event) {
    // The details toggle and the keyboard checkbox handle their own clicks.
    if (event.target.closest(".product-card-toggle, .product-card-input")) return;
    onToggle(product.id);
  }

  return (
    <div className={`product-card${selected ? " selected" : ""}`} onClick={handleCardClick}>
      {/* Visually hidden real checkbox: lets keyboard users Tab to the card and press
          Space to select it, with no change to how the card looks. */}
      <input
        type="checkbox"
        className="product-card-input visually-hidden"
        checked={selected}
        onChange={() => onToggle(product.id)}
        aria-labelledby={titleId}
      />
      <div className="product-card-header">
        <div className="product-card-title" id={titleId}>
          {product.name}
        </div>
        <div className="product-card-checkbox"></div>
      </div>
      <div className="product-card-category">{product.category}</div>
      <button
        type="button"
        className="product-card-toggle"
        aria-expanded={expanded}
        aria-controls={descriptionId}
        onClick={() => setExpanded((open) => !open)}
      >
        <MdExpandMore className="icon" aria-hidden="true" />
        View Details
      </button>
      <div className={`product-description${expanded ? " expanded" : ""}`} id={descriptionId}>
        <p className="product-description-text">{product.description}</p>
      </div>
    </div>
  );
}
