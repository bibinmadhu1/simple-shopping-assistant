# server.py
# Python backend for Simple Shopping Assistant

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3001))

FAKE_STORE_API = 'https://fakestoreapi.com'
DUMMY_JSON_API = 'https://dummyjson.com/products'

# Import Gemini connector
try:
    from gemini import get_gemini_response
    GEMINI_ENABLED = True
except Exception:
    GEMINI_ENABLED = False

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        resp = requests.get(f"{DUMMY_JSON_API}?limit=20")
        resp.raise_for_status()
        return jsonify(resp.json().get('products', []))
    except Exception as e:
        print('Error fetching products:', e)
        return jsonify({'error': 'Failed to fetch products'}), 500

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    try:
        resp = requests.get(f"{DUMMY_JSON_API}/category/{category}")
        resp.raise_for_status()
        return jsonify(resp.json().get('products', []))
    except Exception as e:
        print('Error fetching products by category:', e)
        return jsonify({'error': 'Failed to fetch products by category'}), 500

@app.route('/api/products/search', methods=['GET'])
def search_products():
    q = request.args.get('q', '')
    try:
        resp = requests.get(f"{DUMMY_JSON_API}/search?q={q}")
        resp.raise_for_status()
        return jsonify(resp.json().get('products', []))
    except Exception as e:
        print('Error searching products:', e)
        return jsonify({'error': 'Failed to search products'}), 500

@app.route('/api/v1/products', methods=['GET'])
def get_v1_products():
    try:
        resp = requests.get(f"{FAKE_STORE_API}/products")
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        print('Error fetching products:', e)
        return jsonify({'error': 'Failed to fetch products'}), 500

@app.route('/api/v1/products/category/<category>', methods=['GET'])
def get_v1_products_by_category(category):
    try:
        resp = requests.get(f"{FAKE_STORE_API}/products/category/{category}")
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': 'Failed to fetch products by category'}), 500

@app.route('/api/v1/products/search', methods=['GET'])
def search_v1_products():
    q = request.args.get('q', '')
    try:
        resp = requests.get(f"{FAKE_STORE_API}/products")
        resp.raise_for_status()
        products = resp.json()
        filtered = [p for p in products if q.lower() in p['title'].lower() or q.lower() in p['description'].lower() or q.lower() in p['category'].lower()]
        return jsonify(filtered)
    except Exception as e:
        return jsonify({'error': 'Failed to search products'}), 500

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        resp = requests.get(f"{FAKE_STORE_API}/products")
        resp.raise_for_status()
        products = resp.json()
        import random
        recommendations = random.sample(products, min(4, len(products)))
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': 'Failed to get recommendations'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        response = None
        if GEMINI_ENABLED:
            try:
                response = get_gemini_response(message)
            except Exception as gemini_error:
                print('Gemini error:', gemini_error)
                response = "Sorry, I couldn't process your request with Gemini. Please try again later."
        if not response:
            lower_message = message.lower()
            response = "I'm here to help with your shopping needs!"
            if 'hello' in lower_message or 'hi' in lower_message:
                response = "Hello! How can I assist with your shopping today?"
            elif 'price' in lower_message or 'cost' in lower_message:
                response = "Our prices are very competitive. Which product are you interested in?"
            elif 'shipping' in lower_message or 'delivery' in lower_message:
                response = "We offer free shipping on orders over $50. Delivery usually takes 3-5 business days."
            elif 'return' in lower_message or 'exchange' in lower_message:
                response = "We have a 30-day return policy. Items must be unused and in original packaging."
            elif 'electronics' in lower_message:
                response = "We have a great selection of electronics including laptops, smartphones, and accessories. Check out our electronics category!"
            elif 'clothing' in lower_message or 'clothes' in lower_message:
                response = "We offer a variety of men's and women's clothing. Is there a specific type you're looking for?"
            elif 'jewelry' in lower_message:
                response = "Our jewelry collection includes rings, necklaces, earrings, and more. All made with high-quality materials."
        return jsonify({'response': response})
    except Exception as e:
        print('Chat error:', e)
        return jsonify({'error': 'Failed to process message'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
