import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
// Removed: import remarkGfm from 'remark-gfm'; to fix the compilation error
import { Search, Send, ShoppingCart, Loader } from 'lucide-react';

// --- Configuration and API Helpers (moved outside App for stability) ---
const API_BASE_URL = 'https://cuddly-halibut-4jvrv9qrprqg374px-3001.app.github.dev';

// --- Utility Components ---

/**
 * ChatMessageRenderer: Renders rich text (Markdown) messages.
 * Note: External plugins like remarkGfm were removed to fix compilation issues 
 * in single-file environments.
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
    <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-full h-32 object-contain rounded-lg mb-3 bg-gray-50"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = `https://placehold.co/150x150/f3f4f6/a1a1aa?text=${product.title.split(' ')[0]}`;
        }}
      />
      <h3 className="text-md font-semibold text-gray-800 mb-1 leading-tight">
        {product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}
      </h3>
      <p className="text-lg font-bold text-indigo-600 mb-3">${product.price}</p>
      <button
        className="flex items-center justify-center w-full bg-indigo-500 text-white py-2 px-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors duration-200 shadow-md disabled:bg-indigo-300"
      >
        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
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
    <div className="w-full lg:w-3/5 bg-white p-6 rounded-2xl shadow-xl space-y-4">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-2 mb-4">{title}</h2>
      
      {isLoading && (
        <div className="flex items-center justify-center p-12 text-indigo-500">
          <Loader className="w-8 h-8 animate-spin mr-3" />
          <span className="text-lg font-medium">Loading products...</span>
        </div>
      )}

      {!isLoading && displayProducts.length === 0 && (
        <p className="text-gray-500 italic p-4 text-center">No products found. Try a different search or category!</p>
      )}

      {!isLoading && displayProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
    <div className="space-y-6 p-4 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 relative">
          <input
            type="text"
            placeholder="Search for products (e.g., 'red nail polish')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={searchProducts}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md sm:w-auto"
        >
          Search
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {categoryButtons.map((btn) => (
          <button
            key={btn.category}
            onClick={() => fetchProducts(btn.category)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={getRecommendations}
          className="px-4 py-2 text-sm bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors"
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
    <div className="w-full lg:w-2/5 bg-white p-6 rounded-2xl shadow-xl flex flex-col h-[60vh] lg:h-full">
      <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-2 mb-4">Shopping Assistant</h2>
      
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {chatMessages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow-md ${
              msg.sender === 'user' 
                ? 'bg-indigo-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <ChatMessageRenderer text={msg.text} />
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-xl bg-gray-100 text-gray-600 rounded-tl-none animate-pulse flex items-center">
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          placeholder="Ask me about products..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isChatLoading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-gray-700 disabled:bg-gray-50"
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isChatLoading || !userMessage.trim()}
          className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
        >
          <Send className="w-5 h-5" />
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
    { sender: 'assistant', text: "Hi! I'm your AI shopping assistant. How can I help you today?" }
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
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });
      
      if (!response.ok) throw new Error('Chat API response failed');

      const data = await response.json();
      
      // 2. Add assistant response
      setChatMessages(prev => [...prev, { sender: 'assistant', text: data.response }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [
        ...prev, 
        { sender: 'assistant', text: "Sorry, I'm having trouble connecting right now or the API failed." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [userMessage]); // Dependency on userMessage is necessary

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-4 sm:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700">AI Shopping Assistant</h1>
        <p className="text-lg text-gray-500 mt-1">Find products and get personalized guidance instantly.</p>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Controls Section (Re-renders only if searchQuery or stable functions change) */}
        <ProductSearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchProducts={searchProducts}
          fetchProducts={fetchProducts}
          getRecommendations={getRecommendations}
        />

        {/* Main Content Area (Products and Chat side-by-side) */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Products Section (Re-renders only if products/recommendations/isLoading changes) */}
          <ProductList
            products={products}
            recommendations={recommendations}
            isLoading={isLoading}
          />

          {/* Chat Section (Re-renders only if chat state or stable function change) */}
          <ChatSection
            chatMessages={chatMessages}
            userMessage={userMessage}
            setUserMessage={setUserMessage} // Prop from useState is stable
            handleSendMessage={handleSendMessage} // Stable due to useCallback
            isChatLoading={isChatLoading}
          />
        </div>
      </div>

      {/* Custom Tailwind Scrollbar CSS for chat messages */}
      <style>{`
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
        .markdown-content h1, .markdown-content h2 {
            font-size: 1.1em;
            font-weight: bold;
            margin-top: 0.5rem;
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
