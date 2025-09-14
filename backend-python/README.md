# backend-python/README.md

This is a Python backend for the Simple Shopping Assistant project. It provides similar API endpoints as the Node.js backend, including product search, category filtering, recommendations, and chat integration with Google Gemini.

## Requirements
- Python 3.8+
- Flask
- requests
- python-dotenv

## Setup
1. Create a Python virtual environment (recommended):
   python3 -m venv venv
   source venv/bin/activate
2. Install dependencies:
   pip install -r requirements.txt
3. Set up your .env file with GEMINI_API_KEY.
4. Run the server:
   python server.py

## Endpoints
- `/api/products` - Get products
- `/api/products/category/<category>` - Get products by category
- `/api/products/search?q=<query>` - Search products
- `/api/recommendations` - Get product recommendations
- `/api/chat` - Chat endpoint (uses Gemini if API key is set)
