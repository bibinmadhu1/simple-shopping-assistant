// Backend (Node.js) - server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// FakeStore API base URL
const FAKE_STORE_API = 'https://fakestoreapi.com';

// Get all products or by category
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${FAKE_STORE_API}/products`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const response = await axios.get(`${FAKE_STORE_API}/products/category/${category}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${FAKE_STORE_API}/products`);
    
    // Simple client-side filtering since FakeStore API doesn't have search
    const filteredProducts = response.data.filter(product => 
      product.title.toLowerCase().includes(q.toLowerCase()) ||
      product.description.toLowerCase().includes(q.toLowerCase()) ||
      product.category.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get recommendations (using a simple algorithm for demo)
app.get('/api/recommendations', async (req, res) => {
  try {
    const response = await axios.get(`${FAKE_STORE_API}/products`);
    const products = response.data;
    
    // Simple recommendation algorithm (in a real app, this would be more sophisticated)
    const recommendations = products
      .sort(() => 0.5 - Math.random()) // Shuffle array
      .slice(0, 4); // Get first 4 items
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Chat endpoint using OpenAI API
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // For demo purposes, we'll use a simple rule-based response
    // In a real application, you would use the OpenAI API
    
    const lowerMessage = message.toLowerCase();
    let response = "I'm here to help with your shopping needs!";
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = "Hello! How can I assist with your shopping today?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = "Our prices are very competitive. Which product are you interested in?";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      response = "We offer free shipping on orders over $50. Delivery usually takes 3-5 business days.";
    } else if (lowerMessage.includes('return') || lowerMessage.includes('exchange')) {
      response = "We have a 30-day return policy. Items must be unused and in original packaging.";
    } else if (lowerMessage.includes('electronics')) {
      response = "We have a great selection of electronics including laptops, smartphones, and accessories. Check out our electronics category!";
    } else if (lowerMessage.includes('clothing') || lowerMessage.includes('clothes')) {
      response = "We offer a variety of men's and women's clothing. Is there a specific type you're looking for?";
    } else if (lowerMessage.includes('jewelry')) {
      response = "Our jewelry collection includes rings, necklaces, earrings, and more. All made with high-quality materials.";
    }
    
    // If you have an OpenAI API key, you can uncomment and use this code instead:
    /*
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful shopping assistant for an e-commerce store. Be friendly and helpful." 
        },
        { role: "user", content: message }
      ],
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const response = openaiResponse.data.choices[0].message.content;
    */
    
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});