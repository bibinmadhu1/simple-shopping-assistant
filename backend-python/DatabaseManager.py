import sqlite3
import datetime
import json
import os
import requests

# --- Configuration ---
DATABASE_NAME = 'shopping_assistant.db'
class DatabaseManager:
    """Manages database connection and schema initialization."""

    def __init__(self, db_name=DATABASE_NAME):
        self.db_name = db_name

    def _get_connection(self):
        """Internal helper to get a database connection."""
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row # Allows accessing columns by name
        return conn

    def init_db(self):
        """Initializes the database by creating tables if they don't exist."""
        conn = self._get_connection()
        cursor = conn.cursor()

        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gemini_session_id TEXT UNIQUE,
                name TEXT,
                address TEXT,
                payment_method TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create orders table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                product_id TEXT,
                product_name TEXT,
                quantity INTEGER,
                price_per_item REAL,
                total_amount REAL,
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        # Create returns table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS returns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                reason TEXT,
                status TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        ''')

        conn.commit()
        conn.close()
        print(f"Database '{self.db_name}' initialized successfully.")

class UserDB:
    """Handles CRUD operations for the 'users' table."""

    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def create_user(self, gemini_session_id, name, address, payment_method):
        """Creates a new user and returns their ID."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO users (gemini_session_id, name, address, payment_method)
                VALUES (?, ?, ?, ?)
            ''', (gemini_session_id, name, address, payment_method))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            print(f"User with session ID {gemini_session_id} already exists.")
            return None
        finally:
            conn.close()

    def get_user_by_session_id(self, gemini_session_id):
        """Retrieves a user by their Gemini session ID."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE gemini_session_id = ?', (gemini_session_id,))
        user = cursor.fetchone()
        conn.close()
        return user

    def update_user_info(self, user_id, name=None, address=None, payment_method=None):
        """Updates user information."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        updates = []
        params = []
        if name:
            updates.append("name = ?")
            params.append(name)
        if address:
            updates.append("address = ?")
            params.append(address)
        if payment_method:
            updates.append("payment_method = ?")
            params.append(payment_method)

        if not updates:
            return False

        query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
        params.append(user_id)
        cursor.execute(query, tuple(params))
        conn.commit()
        conn.close()
        return True


class OrderDB:
    """Handles CRUD operations for the 'orders' table."""

    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def create_order(self, user_id, product_id, product_name, quantity, price_per_item, status='pending'):
        """Creates a new order and returns its ID."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        total_amount = quantity * price_per_item
        cursor.execute('''
            INSERT INTO orders (user_id, product_id, product_name, quantity, price_per_item, total_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, product_id, product_name, quantity, price_per_item, total_amount, status))
        conn.commit()
        order_id = cursor.lastrowid
        conn.close()
        return order_id

    def get_user_orders(self, user_id):
        """Retrieves all orders for a given user."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', (user_id,))
        orders = cursor.fetchall()
        conn.close()
        return orders

    def get_order_details(self, order_id):
        """Retrieves details for a specific order."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
        order = cursor.fetchone()
        conn.close()
        return order

    def update_order_status(self, order_id, new_status):
        """Updates the status of an order."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE orders SET status = ? WHERE id = ?', (new_status, order_id))
        conn.commit()
        conn.close()
        return True


class ReturnDB:
    """Handles CRUD operations for the 'returns' table."""

    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def request_return(self, order_id, reason, status='requested'):
        """Creates a new return request and returns its ID."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO returns (order_id, reason, status)
            VALUES (?, ?, ?)
        ''', (order_id, reason, status))
        conn.commit()
        return_id = cursor.lastrowid
        conn.close()
        return return_id

    def get_returns_for_order(self, order_id):
        """Retrieves all return requests for a given order."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM returns WHERE order_id = ? ORDER BY return_date DESC', (order_id,))
        returns = cursor.fetchall()
        conn.close()
        return returns

    def update_return_status(self, return_id, new_status):
        """Updates the status of a return request."""
        conn = self.db_manager._get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE returns SET status = ? WHERE id = ?', (new_status, return_id))
        conn.commit()
        conn.close()
        return True