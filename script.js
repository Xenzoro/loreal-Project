/* Product catalog */
const products = [
  {
    id: 1,
    name: "Revitalift Cleanser",
    category: "Cleanser",
    description: "A gentle yet effective cleanser that removes makeup and impurities while maintaining skin's natural pH balance. Leaves skin feeling fresh and revitalized."
  },
  {
    id: 2,
    name: "Hyaluronic Acid Serum",
    category: "Serum",
    description: "Lightweight hydrating serum with hyaluronic acid that plumps skin and reduces the appearance of fine lines. Provides intense moisture for supple, glowing skin."
  },
  {
    id: 3,
    name: "Bright Reveal Toner",
    category: "Toner",
    description: "Clarifying toner that refines pores and brightens complexion. Contains botanical extracts to prep skin for subsequent treatments and improve overall radiance."
  },
  {
    id: 4,
    name: "Vitamin C Serum",
    category: "Serum",
    description: "Potent antioxidant serum that brightens skin and boosts collagen production. Helps reduce dark spots, evens skin tone, and provides anti-aging benefits."
  },
  {
    id: 5,
    name: "Collagen Moisturizer",
    category: "Moisturizer",
    description: "Rich hydrating moisturizer infused with collagen and peptides. Firms skin, minimizes fine lines, and creates a smooth, youthful appearance."
  },
  {
    id: 6,
    name: "Eye Defense Cream",
    category: "Eye Care",
    description: "Specialized eye cream targeting dark circles, puffiness, and fine lines. Lightweight formula with caffeine and peptides for a more refreshed look."
  },
  {
    id: 7,
    name: "Elvive Dream Lengths Shampoo",
    category: "Haircare",
    description: "Professional-grade shampoo for long, damaged hair. Cleanses gently while repairing and strengthening strands from root to tip."
  },
  {
    id: 8,
    name: "True Match Foundation",
    category: "Makeup",
    description: "Shade-matching foundation that adapts to your skin tone for a perfect, natural finish. Provides buildable coverage with a lightweight, comfortable feel."
  }
];

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const productGrid = document.getElementById("productGrid");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutineBtn");
const clearSelectedBtn = document.getElementById("clearSelectedBtn");

// Set initial message
chatWindow.textContent = "👋 Hello, I am Lori, L'Oréal's AI Chatbot how can I help you today?";

// Initialize conversation history with system prompt
let messageLogToAI = [{
  role: `system`, 
  content: `
      You are Lori, a L'Oréal AI beauty advisor.

      Your job is to recommend L'Oréal products and routines in a clear, simple, and structured way.
      
      CRITICAL RULES FOR PRODUCT RECOMMENDATIONS:
      - You MUST ONLY recommend products that the user explicitly provided to you
      - NEVER suggest products not in the user's selected product list
      - NEVER recommend alternative products, substitutes, or additional products
      - Build routines using ONLY the products provided
      - If the user provides 2 products, use exactly 2 products in the routine
      - Do NOT invent or suggest missing product categories
      - Focus on how to use the specific products provided in the best order
      
      Formatting rules:
      - Use plain text only (no markdown, no asterisks, no special characters)
      - Do NOT use symbols like *, **, -, or #
      - Use numbered steps with this format:
      
      1. Product Name:
      Brief explanation of how to use it and why.
      
      2. Next Product Name:
      Brief explanation of how to use it and why.
      
      3. Continue for all provided products...
      
      - Keep sentences short and easy to read
      - Add spacing between each step
      - Do not use bold formatting
      - Always use the exact product names provided
      
      If the question is unrelated to beauty or L'Oréal products, respond with a clever tie back into telling the user
      you can only answer questions about L'Oréal
      `
}];

// Track selected products
let selectedProducts = [];

// Chat message log for display
let messageLog = [];

// Worker URL
const workerURL = "https://loreal-worker.xenzoro.workers.dev";

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  renderProductCards();
  restoreSelectedProducts();
});

/* Product Card Rendering */
function renderProductCards() {
  productGrid.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    if (selectedProducts.find(p => p.id === product.id)) {
      card.classList.add('selected');
    }
    
    card.innerHTML = `
      <div class="product-card-header">
        <div class="product-card-title">${product.name}</div>
        <div class="product-card-checkbox"></div>
      </div>
      <div class="product-card-category">${product.category}</div>
      <button type="button" class="product-card-toggle" data-product-id="${product.id}">
        <span class="material-icons">expand_more</span>
        View Details
      </button>
      <div class="product-description" data-product-id="${product.id}">
        <p class="product-description-text">${product.description}</p>
      </div>
    `;
    
    // Toggle selection on card click (excluding description toggle button)
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.product-card-toggle')) {
        toggleProductSelection(product);
      }
    });
    
    // Toggle description
    card.querySelector('.product-card-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.querySelector('.product-description').classList.toggle('expanded');
    });
    
    productGrid.appendChild(card);
  });
}

/* Product Selection Management */
function toggleProductSelection(product) {
  const index = selectedProducts.findIndex(p => p.id === product.id);
  
  if (index > -1) {
    selectedProducts.splice(index, 1);
  } else {
    selectedProducts.push(product);
  }
  
  saveSelectedProducts();
  renderProductCards();
  updateSelectedProductsList();
  updateButtonStates();
}

function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter(p => p.id !== productId);
  saveSelectedProducts();
  renderProductCards();
  updateSelectedProductsList();
  updateButtonStates();
}

function updateSelectedProductsList() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = '<p class="empty-state">No products selected yet.</p>';
    return;
  }
  
  selectedProductsList.innerHTML = selectedProducts
    .map(product => `
      <div class="selected-product-item">
        <span class="selected-product-name">${product.name}</span>
        <button type="button" class="selected-product-remove" data-product-id="${product.id}" title="Remove ${product.name}">
          ✕
        </button>
      </div>
    `)
    .join('');
  
  selectedProductsList.querySelectorAll('.selected-product-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSelectedProduct(parseInt(btn.dataset.productId));
    });
  });
}

function updateButtonStates() {
  const hasSelection = selectedProducts.length > 0;
  generateRoutineBtn.disabled = !hasSelection;
  clearSelectedBtn.disabled = !hasSelection;
}

/* localStorage Management */
function saveSelectedProducts() {
  const selectedIds = selectedProducts.map(p => p.id);
  localStorage.setItem('selectedProductIds', JSON.stringify(selectedIds));
}

function restoreSelectedProducts() {
  const stored = localStorage.getItem('selectedProductIds');
  if (stored) {
    const selectedIds = JSON.parse(stored);
    selectedProducts = products.filter(p => selectedIds.includes(p.id));
    updateSelectedProductsList();
    updateButtonStates();
    renderProductCards();
  }
}

function clearAllSelected() {
  selectedProducts = [];
  localStorage.removeItem('selectedProductIds');
  updateSelectedProductsList();
  updateButtonStates();
  renderProductCards();
}

/* Generate Routine */
generateRoutineBtn.addEventListener('click', async () => {
  if (selectedProducts.length === 0) {
    alert('Please select at least one product before generating a routine.');
    return;
  }
  
  const productNames = selectedProducts.map(p => p.name).join(', ');
  const productDescriptions = selectedProducts
    .map(p => `${p.name} (${p.category}): ${p.description}`)
    .join('\n\n');
  
  const routineRequest = `Please create a personalized step-by-step beauty routine using ONLY these L'Oréal products that I have selected:

Selected Products:
${productNames}

Product Details:
${productDescriptions}

IMPORTANT CONSTRAINTS:
1. You MUST use ONLY the products listed above
2. Do NOT recommend any other products or alternatives
3. Do NOT suggest additional products that I did not select
4. If I selected fewer products, work with what I selected
5. Build the routine in the optimal order for these specific products
6. Explain how each selected product fits into the routine

Build a clear, easy-to-follow routine that uses ONLY these products in the right order.`;
  
  // Add routine request to conversation history
  messageLogToAI.push({ role: 'user', content: routineRequest });
  messageLog.push(`<div class="chat-message user-message"><span class="bold-label">You:</span> Routine request with selected products</div>`);
  
  // Show loading state
  messageLog.push(`<div class="chat-message assistant-message-box">Thinking. . .</div>`);
  chatWindow.innerHTML = messageLog.join("\n");
  
  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messageLogToAI,
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const result = await response.json();
    const replyText = result.choices[0].message.content;
    
    messageLogToAI.push({ role: 'assistant', content: replyText });
    messageLog.pop(); // Remove loading message
    messageLog.push(`<div class="chat-message assistant-message-box"><span class="bold-label">Lori:</span> ${replyText}</div>`);
    
    chatWindow.innerHTML = messageLog.join("\n");
    
  } catch(error) {
    console.error(`Error:`, error);
    messageLog.pop(); // Remove loading message
    messageLog.push(`<div class="chat-message assistant-message-box">Something went wrong. Please try again.</div>`);
    chatWindow.innerHTML = messageLog.join("\n");
  }
});

clearSelectedBtn.addEventListener('click', () => {
  clearAllSelected();
});

/* Handle Chat Form Submit */
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  // Show loading message
  messageLog.push(`<div class="chat-message assistant-message-box">Thinking. . .</div>`);
  chatWindow.innerHTML = messageLog.join("\n");
  
  // Add user message to conversation history
  messageLogToAI.push({ role: `user`, content: userInput.value });
  messageLog.pop(); // Remove loading message
  messageLog.push(`<div class="chat-message user-message"><span class="bold-label">You:</span> ${userInput.value}</div>`);
  
  try {
    // Send request through Cloudflare Worker
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messageLogToAI,
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const result = await response.json();
    const replyText = result.choices[0].message.content;
    
    // Add assistant response to conversation history
    messageLogToAI.push({ role: `assistant`, content: replyText });
    messageLog.push(`<div class="chat-message assistant-message-box"><span class="bold-label">Lori:</span> ${replyText}</div>`);
    
    chatWindow.innerHTML = messageLog.join("\n");
    
  } catch(error) {
    console.error(`Error:`, error);
    messageLog.push(`<div class="chat-message assistant-message-box">Something went wrong. Please try again.</div>`);
    chatWindow.innerHTML = messageLog.join("\n");
  }
  
  userInput.value = "";
});
