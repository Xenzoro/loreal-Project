import { MdNorthEast } from "react-icons/md";

export default function Home() {
  return (
    <>
      <section className="products-section" aria-label="L'Oréal product selection">
        <div className="products-header">
          <div>
            <p className="panel-label">Choose Products</p>
            <h2>Select Your Favorites</h2>
          </div>
        </div>

        <div id="productGrid" className="product-grid"></div>

        <div className="selected-products-container">
          <div className="selected-header">
            <p className="panel-label">Selected Products</p>
            <h3>Your Routine</h3>
          </div>
          <div id="selectedProductsList" className="selected-products-list">
            <p className="empty-state">No products selected yet.</p>
          </div>
          <div className="products-actions">
            <button id="generateRoutineBtn" className="btn-primary" disabled>
              Generate Routine
            </button>
            <button id="clearSelectedBtn" className="btn-secondary" disabled>
              Clear Selected
            </button>
          </div>
        </div>
      </section>

      <section className="advisor-panel" aria-label="L'Oréal smart advisor chat">
        <div className="panel-header">
          <div>
            <p className="panel-label">Live advisor</p>
            <h2>Chat with Lori</h2>
          </div>
          <span className="status-pill">Online</span>
        </div>

        <div id="chatWindow" className="chat-window" aria-live="polite">
          👋 Hello, I am Lori, L&apos;Oréal&apos;s AI Chatbot how can I help you today?
        </div>

        <form id="chatForm" className="chat-form">
          <label htmlFor="userInput" className="visually-hidden">
            Message
          </label>
          <input
            id="userInput"
            name="userInput"
            type="text"
            placeholder="Ask about ingredients, routines, shades, or product types"
            autoComplete="off"
            required
          />
          <button type="submit" id="sendBtn" aria-label="Send message">
            <MdNorthEast className="icon" aria-hidden="true" />
          </button>
        </form>
      </section>
    </>
  );
}
