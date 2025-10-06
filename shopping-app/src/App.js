import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
// Removed: import remarkGfm from 'remark-gfm'; to fix the compilation error
// Removed: import { Search, Send, ShoppingCart, Loader } from 'lucide-react';

// --- Inline SVG Icons (Replacement for lucide-react) ---

const SearchIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SendIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ShoppingCartIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 12.82a2 2 0 0 0 2 1.18h9.72a2 2 0 0 0 2-1.18L23 6H6" />
  </svg>
);

const LoaderIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


// --- Configuration and API Helpers (moved outside App for stability) ---
const API_BASE_URL = 'https://cuddly-halibut-4jvrv9qrprqg374px-3001.app.github.dev';

// --- Utility Components ---

/**
 * ChatMessageRenderer: Renders rich text (Markdown) messages.
 */
function ChatMessageRenderer({ text }) {
  // Relying only on core ReactMarkdown features
  return (
    <ReactMarkdown className="markdown-content">
      {text}
    </ReactMarkdown>
  );
}

/**
 * ProductCard: Renders a single product item.
 * Memoized as it only depends on the stable 'product' object.
 */
const ProductCard = React.memo(({ product }) => {
  return (
    <div className="product-card">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="product-image"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = `https://placehold.co/150x150/f3f4f6/a1a1aa?text=${product.title.split(' ')[0]}`;
        }}
      />
      <h3 className="product-title">
        {product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}
      </h3>
      <p className="product-price">${product.price}</p>
      <button
        className="add-to-cart-button"
      >
        <ShoppingCartIcon className="icon-small mr-2" /> Add to Cart
      </button>
    </div>
  );
});

/**
 * ProductList: Displays the list of products or recommendations.
 * Memoized as it only re-renders when products/recommendations/loading state changes.
 */
const ProductList = React.memo(({ products, recommendations, isLoading }) => {
  const displayProducts = useMemo(() => {
    return recommendations.length > 0 ? recommendations : products;
  }, [products, recommendations]);

  const title = recommendations.length > 0 ? 'Recommended Products' : 'All Products';

  return (
    <div className="product-list-section">
      <h2 className="section-title">{title}</h2>
      
      {isLoading && (
        <div className="loading-indicator">
          <LoaderIcon className="loader-icon animate-spin mr-3" />
          <span className="medium-text">Loading products...</span>
        </div>
      )}

      {!isLoading && displayProducts.length === 0 && (
        <p className="no-products-message">No products found. Try a different search or category!</p>
      )}

      {!isLoading && displayProducts.length > 0 && (
        <div className="product-grid">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * ProductSearchControls: Handles search bar and category buttons.
 * Receives stable callbacks (useCallback) from App.
 */
const ProductSearchControls = React.memo(({ searchQuery, setSearchQuery, searchProducts, fetchProducts, getRecommendations }) => {
  const categoryButtons = [
    { label: "Jewellery", category: "womens-jewellery" },
    { label: "Kitchen", category: "kitchen-accessories" },
    { label: "Smartphones", category: "smartphones" },
    { label: "Laptops", category: "laptops" },
  ];

  return (
    <div className="search-controls-container">
      <div className="search-input-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for products (e.g., 'red nail polish')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            className="search-input"
          />
          <SearchIcon className="search-icon" />
        </div>
        <button
          onClick={searchProducts}
          className="search-button"
        >
          Search
        </button>
      </div>
      
      <div className="category-buttons-group">
        {categoryButtons.map((btn) => (
          <button
            key={btn.category}
            onClick={() => fetchProducts(btn.category)}
            className="category-button"
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={getRecommendations}
          className="recommendation-button"
        >
          Recommended for You
        </button>
      </div>
    </div>
  );
});


/**
 * ChatSection: Displays chat history and handles input.
 * Memoized as it only re-renders when chat messages or user input change (via props).
 */
const ChatSection = React.memo(({ chatMessages, userMessage, setUserMessage, handleSendMessage, isChatLoading }) => {
  const messagesEndRef = React.useRef(null);

  // Auto-scroll to the latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="chat-section">
      <h2 className="section-title">Shopping Assistant</h2>
      
      {/* Messages Display */}
      <div className="chat-messages custom-scrollbar">
        {chatMessages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`chat-bubble ${
              msg.sender === 'user' 
                ? 'user-bubble' 
                : 'assistant-bubble'
            }`}>
              <ChatMessageRenderer text={msg.text} />
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="loading-bubble">
              <LoaderIcon className="icon-small animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Ask me about products..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isChatLoading}
          className="chat-input"
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isChatLoading || !userMessage.trim()}
          className="send-button"
        >
          <SendIcon className="icon-medium" />
        </button>
      </div>
    </div>
  );
});


// --- Main Application Component ---

const App = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: "Hi! I'm your AI shopping assistant. I can help you find products, compare prices, or give you personalized recommendations. What are you looking for today?" }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Used for products/recommendations loading
  const [isChatLoading, setIsChatLoading] = useState(false); // Used specifically for chat responses

  // Fetch initial products
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Callbacks (Wrapped in useCallback to ensure stable function references)

  const fetchProducts = useCallback(async (category = '') => {
    setIsLoading(true);
    setRecommendations([]); // Clear recommendations when fetching general products
    try {
      const url = category 
        ? `${API_BASE_URL}/api/products/category/${category}`
        : `${API_BASE_URL}/api/products`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setRecommendations([]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]); // Dependency on searchQuery is necessary

  const getRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts([]); // Clear standard products view
      setRecommendations(data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for this function

  const handleSendMessage = useCallback(async () => {
    if (!userMessage.trim()) return;
    
    const messageToSend = userMessage.trim();
    
    // 1. Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: messageToSend }]);
    setUserMessage(''); // Clear input immediately
    setIsChatLoading(true);
    
    try {
      // Exponential backoff retry logic for API call
      let response;
      const maxRetries = 3;
      let delay = 1000;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageToSend }),
          });

          if (response.ok) break;

          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        } catch (e) {
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            throw e;
          }
        }
      }

      if (!response || !response.ok) throw new Error('Chat API response failed after retries.');

      const data = await response.json();
      
      // 2. Add assistant response
      setChatMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [
        ...prev, 
        { sender: 'assistant', text: "Sorry, I'm having trouble connecting to the backend or the API failed. Please try again." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [userMessage]); // Dependency on userMessage is necessary

  // --- Main Render ---
  return (
    <div className="app-container">
      <header className="header-container">
        <h1 className="main-title">AI Shopping Assistant</h1>
        <p className="subtitle">Find products and get personalized guidance instantly.</p>
      </header>

      <div className="main-content">
        {/* Search Controls Section */}
        <ProductSearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchProducts={searchProducts}
          fetchProducts={fetchProducts}
          getRecommendations={getRecommendations}
        />

        {/* Main Content Area (Products and Chat side-by-side) */}
        <div className="content-layout">
          
          {/* Products Section */}
          <ProductList
            products={products}
            recommendations={recommendations}
            isLoading={isLoading}
          />

          {/* Chat Section */}
          <ChatSection
            chatMessages={chatMessages}
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            handleSendMessage={handleSendMessage}
            isChatLoading={isChatLoading}
          />
        </div>
      </div>

      {/* Custom CSS Styles */}
      <style>{`
        /* Global Reset and Base Styles */
        html, body, #root, #root > div {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        /* Helper classes for SVG icons */
        .icon-small {
          width: 1rem;
          height: 1rem;
        }
        .icon-medium {
          width: 1.25rem;
          height: 1.25rem;
        }
        .mr-2 {
          margin-right: 0.5rem;
        }

        /* --- Layout Containers --- */

        .app-container {
          min-height: 100vh;
          background-color: #f9fafb; /* gray-50 */
          color: #1f2937; /* gray-800 */
          padding: 1rem;
        }
        @media (min-width: 640px) { /* sm:p-8 */
          .app-container {
            padding: 2rem;
          }
        }

        .header-container {
          text-align: center;
          margin-bottom: 2rem; /* mb-8 */
        }

        .main-title {
          font-size: 2.25rem; /* text-4xl */
          font-weight: 800; /* font-extrabold */
          color: #4f46e5; /* indigo-700 */
        }

        .subtitle {
          font-size: 1.125rem; /* text-lg */
          color: #6b7280; /* gray-500 */
          margin-top: 0.25rem; /* mt-1 */
        }

        .main-content {
          max-width: 80rem; /* max-w-7xl */
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* space-y-6 */
        }

        .content-layout {
          display: flex;
          flex-direction: column; /* flex-col */
          gap: 1.5rem; /* gap-6 */
        }
        @media (min-width: 1024px) { /* lg:flex-row */
          .content-layout {
            flex-direction: row;
          }
        }

        /* --- Shared Section Titles --- */
        .section-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 800; /* font-extrabold */
          color: #1f2937; /* gray-800 */
          border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
          padding-bottom: 0.5rem; /* pb-2 */
          margin-bottom: 1rem; /* mb-4 */
        }


        /* --- Search Controls --- */
        .search-controls-container {
          padding: 1rem; /* p-4 */
          border-radius: 0.75rem; /* rounded-xl */
          background-color: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* space-y-6 */
        }

        .search-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem; /* gap-3 */
        }
        @media (min-width: 640px) { /* sm:flex-row */
          .search-input-group {
            flex-direction: row;
          }
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1.25rem; /* px-5 py-3 */
          padding-left: 2.5rem; /* pl-10 */
          border: 1px solid #d1d5db; /* border-gray-300 */
          border-radius: 0.5rem; /* rounded-lg */
          color: #374151; /* gray-700 */
          transition: box-shadow 150ms ease-in-out, border-color 150ms ease-in-out;
        }
        .search-input:focus {
          border-color: #4f46e5; /* focus:border-indigo-500 */
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5); /* focus:ring-indigo-500 */
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #9ca3af; /* text-gray-400 */
        }

        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem; /* px-6 py-3 */
          background-color: #4f46e5; /* indigo-600 */
          color: white;
          font-weight: 600; /* font-semibold */
          border-radius: 0.5rem; /* rounded-lg */
          transition: background-color 200ms ease-in-out, box-shadow 200ms ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* shadow-md */
          white-space: nowrap;
          border: none;
        }
        .search-button:hover {
          background-color: #4338ca; /* hover:bg-indigo-700 */
        }
        @media (min-width: 640px) { /* sm:w-auto */
          .search-button {
            width: auto;
          }
        }

        .category-buttons-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem; /* gap-2 */
          padding-top: 0.5rem; /* pt-2 */
          border-top: 1px solid #f3f4f6; /* border-t border-gray-100 */
          justify-content: center;
        }
        @media (min-width: 640px) { /* sm:justify-start */
          .category-buttons-group {
            justify-content: flex-start;
          }
        }

        .category-button, .recommendation-button {
          padding: 0.5rem 1rem; /* px-4 py-2 */
          font-size: 0.875rem; /* text-sm */
          border-radius: 9999px; /* rounded-full */
          transition: background-color 200ms ease-in-out, color 200ms ease-in-out, box-shadow 200ms ease-in-out;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }

        .category-button {
          background-color: #f3f4f6; /* bg-gray-100 */
          color: #374151; /* text-gray-700 */
        }
        .category-button:hover {
          background-color: #e0e7ff; /* hover:bg-indigo-100 */
          color: #4f46e5; /* hover:text-indigo-700 */
        }

        .recommendation-button {
          background-color: #ec4899; /* bg-pink-500 */
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* shadow-md */
        }
        .recommendation-button:hover {
          background-color: #db2777; /* hover:bg-pink-600 */
        }


        /* --- Product List --- */

        .product-list-section {
          width: 100%;
          background-color: white;
          padding: 1.5rem; /* p-6 */
          border-radius: 1rem; /* rounded-2xl */
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); /* shadow-xl */
          display: flex;
          flex-direction: column;
          gap: 1rem; /* space-y-4 */
        }
        @media (min-width: 1024px) { /* lg:w-3/5 */
          .product-list-section {
            width: 60%; /* 3/5 width */
          }
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem; /* p-12 */
          color: #6366f1; /* text-indigo-500 */
        }

        .loader-icon {
          width: 2rem;
          height: 2rem;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .medium-text {
          font-size: 1.125rem; /* text-lg */
          font-weight: 500; /* font-medium */
        }

        .no-products-message {
          color: #6b7280; /* text-gray-500 */
          font-style: italic;
          padding: 1rem; /* p-4 */
          text-align: center;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
          gap: 1rem; /* gap-4 */
        }
        @media (min-width: 640px) { /* sm:grid-cols-3 */
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1280px) { /* xl:grid-cols-4 */
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        /* --- Product Card --- */
        .product-card {
          background-color: white;
          padding: 1rem; /* p-4 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* shadow-lg */
          transition: box-shadow 300ms ease-in-out;
          border: 1px solid #f3f4f6; /* border border-gray-100 */
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .product-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* hover:shadow-xl */
        }

        .product-image {
          width: 100%;
          height: 8rem; /* h-32 */
          object-fit: contain;
          border-radius: 0.5rem; /* rounded-lg */
          margin-bottom: 0.75rem; /* mb-3 */
          background-color: #f9fafb; /* bg-gray-50 */
        }

        .product-title {
          font-size: 1rem; /* text-md */
          font-weight: 600; /* font-semibold */
          color: #1f2937; /* text-gray-800 */
          margin-bottom: 0.25rem; /* mb-1 */
          line-height: 1.25; /* leading-tight */
        }

        .product-price {
          font-size: 1.125rem; /* text-lg */
          font-weight: 700; /* font-bold */
          color: #4f46e5; /* indigo-600 */
          margin-bottom: 0.75rem; /* mb-3 */
        }

        .add-to-cart-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: #6366f1; /* indigo-500 */
          color: white;
          padding: 0.5rem 0.75rem; /* py-2 px-3 */
          border-radius: 0.5rem; /* rounded-lg */
          font-weight: 500; /* font-medium */
          transition: background-color 200ms ease-in-out, box-shadow 200ms ease-in-out;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); /* shadow-md */
          border: none;
          cursor: pointer;
        }
        .add-to-cart-button:hover {
          background-color: #4f46e5; /* hover:bg-indigo-600 */
        }
        .add-to-cart-button:disabled {
          background-color: #a5b4fc; /* disabled:bg-indigo-300 */
          cursor: not-allowed;
        }


        /* --- Chat Section --- */

        .chat-section {
          width: 100%;
          background-color: white;
          padding: 1.5rem; /* p-6 */
          border-radius: 1rem; /* rounded-2xl */
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); /* shadow-xl */
          display: flex;
          flex-direction: column;
          height: 60vh; /* h-[60vh] */
        }
        @media (min-width: 1024px) { /* lg:w-2/5 lg:h-[70vh] */
          .chat-section {
            width: 40%; /* 2/5 width */
            height: 70vh;
          }
        }
        @media (min-width: 1280px) { /* xl:h-[80vh] */
          .chat-section {
            height: 80vh;
          }
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem; /* pr-2 */
          display: flex;
          flex-direction: column;
          gap: 1rem; /* space-y-4 (simulated by gap) */
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1; /* slate-300 */
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9; /* slate-100 */
        }

        .message-row {
          display: flex;
        }
        .message-row.justify-end {
          justify-content: flex-end;
        }
        .message-row.justify-start {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 80%; /* max-w-xs/sm:max-w-md */
          padding: 0.75rem; /* p-3 */
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
        }
        @media (min-width: 640px) {
          .chat-bubble {
            max-width: 66.66%; /* Simulating sm:max-w-md */
          }
        }

        .user-bubble {
          background-color: #6366f1; /* bg-indigo-500 */
          color: white;
          border-bottom-right-radius: 0; /* rounded-br-none */
        }

        .assistant-bubble {
          background-color: #f3f4f6; /* bg-gray-100 */
          color: #1f2937; /* text-gray-800 */
          border-top-left-radius: 0; /* rounded-tl-none */
        }
        
        .loading-bubble {
          max-width: 80%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background-color: #f3f4f6;
          color: #4b5563; /* gray-600 */
          border-top-left-radius: 0;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          display: flex;
          align-items: center;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .chat-input-container {
          margin-top: 1rem; /* mt-4 */
          padding-top: 1rem; /* pt-4 */
          border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
          display: flex;
          gap: 0.5rem; /* gap-2 */
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem; /* px-4 py-3 */
          border: 1px solid #d1d5db; /* border-gray-300 */
          border-radius: 0.5rem; /* rounded-lg */
          color: #374151; /* text-gray-700 */
          transition: box-shadow 150ms ease-in-out, border-color 150ms ease-in-out;
        }
        .chat-input:focus {
          border-color: #4f46e5; /* focus:border-indigo-500 */
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5); /* focus:ring-indigo-500 */
          outline: none;
        }
        .chat-input:disabled {
          background-color: #f9fafb; /* disabled:bg-gray-50 */
        }

        .send-button {
          background-color: #4f46e5; /* indigo-600 */
          color: white;
          padding: 0.75rem; /* p-3 */
          border-radius: 0.5rem; /* rounded-lg */
          transition: background-color 200ms ease-in-out;
          border: none;
          cursor: pointer;
        }
        .send-button:hover:not(:disabled) {
          background-color: #4338ca; /* hover:bg-indigo-700 */
        }
        .send-button:disabled {
          background-color: #a5b4fc; /* disabled:bg-indigo-300 */
          cursor: not-allowed;
        }

        /* --- Markdown Styles --- */
        .markdown-content h1, .markdown-content h2 {
            font-size: 1.1em;
            font-weight: bold;
            margin-top: 0.5rem;
            margin-bottom: 0.25rem;
        }
        .markdown-content ul {
            list-style-type: disc;
            margin-left: 1.25rem;
            padding-left: 0.25rem;
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default App;
