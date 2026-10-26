// Server component: everything here is rendered to static HTML at build time.
// The client components inside (cards, selected list, chat) hydrate in the browser.
import AdvisorProvider from "@/components/AdvisorProvider";
import ChatPanel from "@/components/ChatPanel";
import ProductGrid from "@/components/ProductGrid";
import SelectedProducts from "@/components/SelectedProducts";

export default function Home() {
  return (
    <AdvisorProvider>
      <section className="products-section" aria-label="L'Oréal product selection">
        <div className="products-header">
          <div>
            <p className="panel-label">Choose Products</p>
            <h2>Select Your Favorites</h2>
          </div>
        </div>

        <ProductGrid />

        <div className="selected-products-container">
          <div className="selected-header">
            <p className="panel-label">Selected Products</p>
            <h3>Your Routine</h3>
          </div>
          <SelectedProducts />
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

        <ChatPanel />
      </section>
    </AdvisorProvider>
  );
}
