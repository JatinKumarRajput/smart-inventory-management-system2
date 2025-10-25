from flask import request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from functools import wraps

from app import create_app, mysql, bcrypt
from app.models import (
    get_all_products, create_product, update_product, delete_product,
    get_all_suppliers, create_supplier, update_supplier, delete_supplier,
    get_inventory, add_inventory, update_inventory, delete_inventory,
    get_transactions, add_transaction, delete_transaction,
    get_alerts, add_alert, update_alert, delete_alert,
    get_user_by_username, User  # Add these two
)

app = create_app()

@app.route('/health')
def health_check():
    return {"status": "Backend running"}

# app/routes.py

from flask import request, jsonify
from app import create_app
from app.models import get_all_products, create_product, update_product, delete_product

#app, mysql = create_app()

@app.route('/products', methods=['GET'])
def list_products():
    products = get_all_products(mysql)
    return jsonify(products), 200

@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    create_product(mysql, data)
    return jsonify({'message': 'Product created successfully'}), 201

@app.route('/products/<int:product_id>', methods=['PUT'])
def edit_product(product_id):
    data = request.json
    update_product(mysql, product_id, data)
    return jsonify({'message': 'Product updated successfully'}), 200

@app.route('/products/<int:product_id>', methods=['DELETE'])
def remove_product(product_id):
    delete_product(mysql, product_id)
    return jsonify({'message': 'Product deleted successfully'}), 200


# app/routes.py

from app.models import get_all_suppliers, create_supplier, update_supplier, delete_supplier

@app.route('/suppliers', methods=['GET'])
def list_suppliers():
    suppliers = get_all_suppliers(mysql)
    return jsonify(suppliers), 200

@app.route('/suppliers', methods=['POST'])
def add_supplier():
    data = request.json
    create_supplier(mysql, data)
    return jsonify({'message': 'Supplier created successfully'}), 201

@app.route('/suppliers/<int:supplier_id>', methods=['PUT'])
def edit_supplier(supplier_id):
    data = request.json
    update_supplier(mysql, supplier_id, data)
    return jsonify({'message': 'Supplier updated successfully'}), 200

@app.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
def remove_supplier(supplier_id):
    delete_supplier(mysql, supplier_id)
    return jsonify({'message': 'Supplier deleted successfully'}), 200


from app.models import get_inventory, add_inventory, update_inventory, delete_inventory

@app.route('/inventory', methods=['GET'])
def list_inventory():
    items = get_inventory(mysql)
    return jsonify(items), 200

@app.route('/inventory', methods=['POST'])
def add_inventory_item():
    data = request.json
    add_inventory(mysql, data)
    return jsonify({'message': 'Inventory item added'}), 201

@app.route('/inventory/<int:inventory_id>', methods=['PUT'])
def edit_inventory_item(inventory_id):
    data = request.json
    update_inventory(mysql, inventory_id, data)
    return jsonify({'message': 'Inventory updated'}), 200

@app.route('/inventory/<int:inventory_id>', methods=['DELETE'])
@login_required
def remove_inventory_item(inventory_id):
    try:
        delete_inventory(mysql, inventory_id)
        return jsonify({'message': 'Inventory item deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



from app.models import get_transactions, add_transaction, delete_transaction

# GET all transactions
@app.route('/transactions', methods=['GET'])
@login_required
def get_transactions():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT t.transaction_id, t.product_id, p.product_name, t.user_id, t.transaction_type, t.quantity_change, t.transaction_date
            FROM Transactions t
            JOIN Products p ON t.product_id = p.product_id
            ORDER BY t.transaction_date DESC
        """)
        transactions = cursor.fetchall()
        cursor.close()
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST create new transaction
# POST create new transaction and update inventory
@app.route('/transactions', methods=['POST'])
@login_required
def add_transaction():
    try:
        data = request.get_json()
        product_id = data['product_id']
        user_id = data['user_id']
        transaction_type = data['transaction_type']
        quantity_change = data['quantity_change']

        cursor = mysql.connection.cursor()
        
        # Insert the transaction
        cursor.execute("""
            INSERT INTO Transactions (product_id, user_id, transaction_type, quantity_change)
            VALUES (%s, %s, %s, %s)
        """, (product_id, user_id, transaction_type, quantity_change))
        
        # Update the inventory quantity
        cursor.execute("""
            UPDATE Inventory 
            SET quantity = quantity + %s 
            WHERE product_id = %s
        """, (quantity_change, product_id))
        
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Transaction recorded and inventory updated successfully'}), 201
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def remove_transaction(transaction_id):
    delete_transaction(mysql, transaction_id)
    return jsonify({'message': 'Transaction deleted'}), 200


from app.models import get_alerts, add_alert, update_alert, delete_alert

# GET all alerts
@app.route('/alerts', methods=['GET'])
@login_required
def get_alerts():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT a.alert_id, a.inventory_id, i.product_id, p.product_name, 
                   a.alert_type, a.message, a.is_active
            FROM Alerts a
            JOIN Inventory i ON a.inventory_id = i.inventory_id
            JOIN Products p ON i.product_id = p.product_id
            ORDER BY a.is_active DESC, a.alert_id DESC
        """)
        alerts = cursor.fetchall()
        cursor.close()
        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST create new alert
@app.route('/alerts', methods=['POST'])
@login_required
def add_alert():
    try:
        data = request.get_json()
        inventory_id = data['inventory_id']
        alert_type = data['alert_type']
        message = data['message']
        is_active = data.get('is_active', True)

        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO Alerts (inventory_id, alert_type, message, is_active)
            VALUES (%s, %s, %s, %s)
        """, (inventory_id, alert_type, message, is_active))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Alert created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PUT update alert (toggle active status or edit)
@app.route('/alerts/<int:alert_id>', methods=['PUT'])
@login_required
def update_alert(alert_id):
    try:
        data = request.get_json()
        is_active = data.get('is_active')
        message = data.get('message')

        cursor = mysql.connection.cursor()
        
        if is_active is not None and message:
            cursor.execute("""
                UPDATE Alerts 
                SET is_active = %s, message = %s 
                WHERE alert_id = %s
            """, (is_active, message, alert_id))
        elif is_active is not None:
            cursor.execute("""
                UPDATE Alerts 
                SET is_active = %s 
                WHERE alert_id = %s
            """, (is_active, alert_id))
        
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Alert updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE alert
@app.route('/alerts/<int:alert_id>', methods=['DELETE'])
@login_required
def delete_alert(alert_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM Alerts WHERE alert_id = %s", (alert_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Alert deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


from flask import request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import bcrypt, mysql

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']
    role = data.get('role', 'staff')

    existing_user = get_user_by_username(mysql, username)
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO Users (username, password_hash, role) VALUES (%s, %s, %s)", (username, pw_hash, role))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = get_user_by_username(mysql, username)
    if user and bcrypt.check_password_hash(user['password_hash'], password):
        user_obj = User(user['user_id'], user['username'], user['role'])
        login_user(user_obj)
        return jsonify({'message': 'Logged in', 'role': user_obj.role}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@app.route('/profile', methods=['GET'])
@login_required
def profile():
    return jsonify({'user': current_user.username, 'role': current_user.role}), 200


from functools import wraps
from flask_login import current_user

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if current_user.role not in roles:
                return jsonify({'error': 'Access denied'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Usage example:
@app.route('/admin-only', methods=['GET'])
@login_required
@roles_required('admin')
def admin_only_route():
    return jsonify({'message': 'Welcome admin!'})


@app.route('/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    try:
        cursor = mysql.connection.cursor()
        
        # Count total products
        cursor.execute("SELECT COUNT(*) FROM Products")
        total_products = cursor.fetchone()[0]
        
        # Count total suppliers
        cursor.execute("SELECT COUNT(*) FROM Suppliers")
        total_suppliers = cursor.fetchone()[0]
        
        # Count low stock items (quantity <= low_stock_threshold)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Inventory 
            WHERE quantity <= low_stock_threshold
        """)
        low_stock_items = cursor.fetchone()[0]
        
        # Count active alerts
        cursor.execute("SELECT COUNT(*) FROM Alerts WHERE is_active = TRUE")
        active_alerts = cursor.fetchone()[0]
        
        cursor.close()
        
        return jsonify({
            'total_products': total_products,
            'total_suppliers': total_suppliers,
            'low_stock_items': low_stock_items,
            'active_alerts': active_alerts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Get inventory status distribution
@app.route('/dashboard/inventory-status', methods=['GET'])
@login_required
def get_inventory_status():
    try:
        cursor = mysql.connection.cursor()
        
        # Count in stock, low stock, out of stock
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN quantity > low_stock_threshold THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN quantity > 0 AND quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock,
                SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
            FROM Inventory
        """)
        result = cursor.fetchone()
        cursor.close()
        
        return jsonify({
            'in_stock': result[0] or 0,
            'low_stock': result[1] or 0,
            'out_of_stock': result[2] or 0
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get transaction trends (last 30 days)
@app.route('/dashboard/transaction-trends', methods=['GET'])
@login_required
def get_transaction_trends():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT 
                DATE(transaction_date) as date,
                transaction_type,
                COUNT(*) as count
            FROM Transactions
            WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(transaction_date), transaction_type
            ORDER BY date
        """)
        results = cursor.fetchall()
        cursor.close()
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get top 10 low stock products
@app.route('/dashboard/low-stock-products', methods=['GET'])
@login_required
def get_low_stock_products():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT p.product_name, i.quantity, i.low_stock_threshold
            FROM Inventory i
            JOIN Products p ON i.product_id = p.product_id
            WHERE i.quantity <= i.low_stock_threshold
            ORDER BY i.quantity ASC
            LIMIT 10
        """)
        results = cursor.fetchall()
        cursor.close()
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get category distribution
@app.route('/dashboard/category-distribution', methods=['GET'])
@login_required
def get_category_distribution():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM Products
            GROUP BY category
        """)
        results = cursor.fetchall()
        cursor.close()
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
