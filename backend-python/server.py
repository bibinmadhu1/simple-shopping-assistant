# server.py
# Python backend for Simple Shopping Assistant

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from DatabaseManager import DatabaseManager, OrderDB, ReturnDB, UserDB


load_dotenv()
app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3001))

FAKE_STORE_API = 'https://fakestoreapi.com'
DUMMY_JSON_API = 'https://dummyjson.com/products'

gemini_session_id= "example_session_id_12345"  # In real scenarios, this should be dynamic per user/session

db_manager = DatabaseManager() 

# 2. Initialize database handlers with their dependencies
user_db = UserDB(db_manager)
order_db = OrderDB(db_manager)
return_db = ReturnDB(db_manager)

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

@app.route('/api/chat/old', methods=['POST'])
def chatold():
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

def analyze_user_input_with_gemini(self, user_input):
        """Uses Gemini to determine intent and extract entities from user input."""
        if not GEMINI_ENABLED:
            return {'intent': 'unknown', 'entities': {}} # Fallback if Gemini not configured

        prompt_for_gemini = f"""
        The user is interacting with a shopping assistant. Their current message is: "{user_input}"

        Based on the message, identify the user's intent and any relevant entities.
        Possible intents:
        - `greet`: User is saying hello.
        - `search_product`: User is looking for a product.
        - `add_to_cart`: User wants to add an item to their cart (for checkout).
        - `checkout`: User wants to finalize an order.
        - `view_orders`: User wants to see their past orders.
        - `request_return`: User wants to return an item.
        - `provide_info`: User is providing personal info (name, address, payment).
        - `unknown`: Cannot determine intent.

        For `add_to_cart` and `checkout`, try to extract `product_name` and `quantity`.
        For `request_return`, try to extract `order_id` and `reason`.
        For `provide_info`, try to extract `name`, `address`, `payment_method`.

        Return the output as a JSON object with 'intent' and 'entities' keys.
        Example:
        {{
            "intent": "add_to_cart",
            "entities": {{
                "product_name": "iPhone 15",
                "quantity": 1
            }}
        }}
        Or:
        {{
            "intent": "checkout",
            "entities": {{}}
        }}
        Or:
        {{
            "intent": "request_return",
            "entities": {{
                "order_id": "123",
                "reason": "damaged"
            }}
        }}
        If intent is `unknown`, entities should be empty.
        """

        try:
            gemini_response = get_gemini_response(prompt_for_gemini)
            agent_decision = json.loads(gemini_response.text)
            return agent_decision
        except Exception as e:
            print(f"Error parsing Gemini response or communicating with Gemini: {e}")
            return {'intent': 'unknown', 'entities': {}}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        response = None
        if GEMINI_ENABLED:
            try:
                # Assuming 'gemini_session_id', 'user_db', 'analyze_user_input_with_gemini',
                # 'fetch_product_details', 'self.user_db', 'self.order_db', 'self.return_db'
                # are defined or accessible in this scope if this is not a class method,
                # or 'self' implies this is a method and they are attributes of 'self'.
                # Given the context of previous discussions, these would likely be
                # attributes of a class instance that this `chat` function belongs to.
                # For pure formatting, I'll assume they are somehow accessible.
                user = user_db.get_user_by_session_id(gemini_session_id)
                agent_decision = analyze_user_input_with_gemini(message)

                intent = agent_decision.get('intent', 'unknown')
                entities = agent_decision.get('entities', {})

                response_text = "I'm sorry, I couldn't understand that. Can you please rephrase?"

                # --- Agent Logic based on Intent ---
                if intent == 'greet':
                    response_text = "Hello! How can I assist you with your shopping today?"

                elif intent == 'search_product':
                    product_query = entities.get('product_name')
                    if product_query:
                        product = fetch_product_details(product_query)
                        if product:
                            response_text = f"I found '{product['title']}' for ${product['price']}. It's described as: {product['description'][:100]}..."
                        else:
                            response_text = f"I couldn't find any product matching '{product_query}'."
                    else:
                        response_text = "What product are you looking for?"

                elif intent == 'provide_info':
                    name = entities.get('name')
                    address = entities.get('address')
                    payment = entities.get('payment_method')

                    if not user:
                        if name and address and payment:
                            user_id = self.user_db.create_user(gemini_session_id, name, address, payment)
                            if user_id:
                                response_text = f"Thanks, {name}! I've saved your details. Now you can place orders."
                            else:
                                response_text = "I had trouble saving your info. Please try again."
                        else:
                            response_text = "I need your name, address, and payment method to set up your profile."
                    else:
                        user_db.update_user_info(user['id'], name=name, address=address, payment_method=payment)
                        response_text = "Your information has been updated!"

                elif intent == 'add_to_cart' or intent == 'checkout':
                    if not user:
                        response_text = "Please tell me your name, address, and preferred payment method first to set up your profile before checking out."
                        return response_text # This return would exit the outer try block as well

                    product_name = entities.get('product_name')
                    quantity = entities.get('quantity', 1)
                    if product_name and quantity:
                        product = fetch_product_details(product_name)
                        if product:
                            order_id = self.order_db.create_order(user['id'], product['id'], product['title'],
                                                                  quantity, product['price'], status='pending' if intent == 'add_to_cart' else 'shipped')
                            if order_id:
                                if intent == 'add_to_cart':
                                    response_text = f"Added {quantity} x {product['title']} to your pending order. Your pending order ID is {order_id}. You can proceed to checkout anytime."
                                else:
                                    response_text = f"Great! Your order for {quantity} x {product['title']} has been placed (Order ID: {order_id}). It will be shipped to {user['address']} and charged to {user['payment_method']}."
                                    self.order_db.update_order_status(order_id, 'shipped')
                            else:
                                response_text = "Something went wrong while creating your order."
                        else:
                            response_text = f"I couldn't find '{product_name}'. Please specify a valid product."
                    else:
                        response_text = "What product and quantity would you like to add/checkout?"

                elif intent == 'view_orders':
                    if not user:
                        response_text = "Please log in first so I can retrieve your orders."
                    else:
                        orders = self.order_db.get_user_orders(user['id'])
                        if orders:
                            order_list = "\n".join([f"Order ID: {o['id']}, Product: {o['product_name']} ({o['quantity']}), Total: ${o['total_amount']:.2f}, Status: {o['status']}" for o in orders])
                            response_text = f"Here are your recent orders:\n{order_list}"
                        else:
                            response_text = "You haven't placed any orders yet."

                elif intent == 'request_return':
                    if not user:
                        response_text = "Please log in first to request a return."
                    else:
                        order_id = entities.get('order_id')
                        reason = entities.get('reason')
                        if order_id and reason:
                            order = self.order_db.get_order_details(order_id)
                            if order and order['user_id'] == user['id']:
                                if order['status'] in ['delivered', 'shipped']:
                                    return_id = self.return_db.request_return(order_id, reason)
                                    if return_id:
                                        self.order_db.update_order_status(order_id, 'return_requested')
                                        response_text = f"Return for Order ID {order_id} has been requested with reason: '{reason}'. We will process it shortly. Your return request ID is {return_id}."
                                    else:
                                        response_text = "Failed to process your return request."
                                else:
                                    response_text = f"Order ID {order_id} has a status of '{order['status']}' which cannot be returned directly. Please contact support."
                            elif order:
                                response_text = "That order ID does not belong to your account."
                            else:
                                response_text = f"Order ID {order_id} not found."
                        else:
                            response_text = "To request a return, please provide the Order ID and the reason for return."

                response = response_text # Assign the constructed response_text to 'response'
            except Exception as gemini_error:
                print('Gemini error:', gemini_error)
                response = "Sorry, I couldn't process your request with Gemini. Please try again later."
        else: # This 'else' belongs to 'if GEMINI_ENABLED'
             response = "Gemini is not enabled for this assistant." # Added a default if GEMINI_ENABLED is False
        
        # This return would now return 'response_text' if Gemini was successful,
        # or an error message if Gemini failed or was disabled.
        # If the original intent was to return 'response_text' from the inner blocks directly,
        # that would need a re-evaluation of the 'response' variable's purpose.
        # For pure formatting, 'response' gets assigned.
        return response
    except Exception as e:
        print('Chat error:', e)
        # Assuming `jsonify` is imported from Flask or similar
        from flask import jsonify
        return jsonify({'error': 'Failed to process message'}), 500


if __name__ == '__main__':
    db_manager.init_db()
    app.run(host='0.0.0.0', port=PORT)
