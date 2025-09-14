// Frontend (React) - App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 'http://localhost:3001'; //
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||   'https://musical-journey-jj7g7wrgpvvwfj7pq-3001.app.github.dev/'; //'http://localhost:3001';
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: "Hi! I'm your shopping assistant. How can I help you today?" }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial products
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async (category = '') => {
    setIsLoading(true);
    try {
      const url = category 
        ? `${API_BASE_URL}/api/products/category/${category}`
        : `${API_BASE_URL}/api/products`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setIsLoading(false);
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // (remove from here, move to top of file)
      const response = await fetch(`${API_BASE_URL}/api/products/search?q=${searchQuery}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
    setIsLoading(false);
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    const newMessages = [...chatMessages, { sender: 'user', text: userMessage }];
    setChatMessages(newMessages);
    setUserMessage('');
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      // Add assistant response to chat
      setChatMessages([...newMessages, { sender: 'assistant', text: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages([...newMessages, { sender: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Personal Shopping Assistant</h1>
        <p>Your AI-powered shopping guide</p>
      </header>

      <div className="app-container">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
            />
            <button onClick={searchProducts}>Search</button>
          </div>
          
          <div className="category-buttons">
            <button onClick={() => fetchProducts("men's clothing")}>Men's Clothing</button>
            <button onClick={() => fetchProducts("women's clothing")}>Women's Clothing</button>
            <button onClick={() => fetchProducts('jewelery')}>Jewelry</button>
            <button onClick={() => fetchProducts('electronics')}>Electronics</button>
            <button onClick={getRecommendations}>Recommended for You</button>
          </div>
        </div>

        <div className="main-content">
          <div className="products-section">
            <h2>{recommendations.length ? 'Recommended Products' : 'Products'}</h2>
            
            {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="products-grid">
                {(recommendations.length ? recommendations : products).map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.image} alt={product.title} />
                    <h3>{product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h3>
                    <p className="price">${product.price}</p>
                    <button>Add to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chat-section">
            <h2>Shopping Assistant</h2>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div className="message assistant">Thinking...</div>}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Ask me about products..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;