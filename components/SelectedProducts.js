"use client";

import { useAdvisor } from "./AdvisorProvider";

export default function SelectedProducts() {
  const { selected, removeProduct, clearProducts, generateRoutine, sending } = useAdvisor();
  const hasSelection = selected.length > 0;

  return (
    <>
      <div id="selectedProductsList" className="selected-products-list">
        {hasSelection ? (
          selected.map((product) => (
            <div className="selected-product-item" key={product.id}>
              <span className="selected-product-name">{product.name}</span>
              <button
                type="button"
                className="selected-product-remove"
                title={`Remove ${product.name}`}
                aria-label={`Remove ${product.name}`}
                onClick={() => removeProduct(product.id)}
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">No products selected yet.</p>
        )}
      </div>
      <div className="products-actions">
        <button
          id="generateRoutineBtn"
          className="btn-primary"
          disabled={!hasSelection || sending}
          onClick={generateRoutine}
        >
          Generate Routine
        </button>
        <button
          id="clearSelectedBtn"
          className="btn-secondary"
          disabled={!hasSelection}
          onClick={clearProducts}
        >
          Clear Selected
        </button>
      </div>
    </>
  );
}
