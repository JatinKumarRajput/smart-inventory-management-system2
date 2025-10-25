


# app/models.py

def get_all_products(mysql):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Products")
    products = cursor.fetchall()
    cursor.close()
    return products

def create_product(mysql, product):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO Products (product_name, description, category, price, supplier_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        product['product_name'],
        product.get('description'),
        product.get('category'),
        product['price'],
        product['supplier_id']
    ))
    mysql.connection.commit()
    cursor.close()

def update_product(mysql, product_id, product):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE Products SET product_name=%s, description=%s, category=%s, price=%s, supplier_id=%s
        WHERE product_id=%s
    """, (
        product['product_name'],
        product.get('description'),
        product.get('category'),
        product['price'],
        product['supplier_id'],
        product_id
    ))
    mysql.connection.commit()
    cursor.close()

def delete_product(mysql, product_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Products WHERE product_id=%s", (product_id,))
    mysql.connection.commit()
    cursor.close()


# app/models.py

def get_all_suppliers(mysql):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM Suppliers")
    suppliers = cursor.fetchall()
    cursor.close()
    return suppliers

def create_supplier(mysql, supplier):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO Suppliers (supplier_name, contact_email, phone_number)
        VALUES (%s, %s, %s)
    """, (
        supplier['supplier_name'],
        supplier.get('contact_email'),
        supplier.get('phone_number')
    ))
    mysql.connection.commit()
    cursor.close()

def update_supplier(mysql, supplier_id, supplier):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE Suppliers
        SET supplier_name=%s, contact_email=%s, phone_number=%s
        WHERE supplier_id=%s
    """, (
        supplier['supplier_name'],
        supplier.get('contact_email'),
        supplier.get('phone_number'),
        supplier_id
    ))
    mysql.connection.commit()
    cursor.close()

def delete_supplier(mysql, supplier_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Suppliers WHERE supplier_id=%s", (supplier_id,))
    mysql.connection.commit()
    cursor.close()


def get_inventory(mysql):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT Inventory.*, Products.product_name 
        FROM Inventory
        JOIN Products ON Inventory.product_id = Products.product_id
    """)
    items = cursor.fetchall()
    cursor.close()
    return items

def add_inventory(mysql, item):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO Inventory (product_id, quantity, low_stock_threshold)
        VALUES (%s, %s, %s)
    """, (
        item['product_id'],
        item['quantity'],
        item.get('low_stock_threshold', 10)
    ))
    mysql.connection.commit()
    cursor.close()

def update_inventory(mysql, inventory_id, item):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE Inventory SET quantity=%s, low_stock_threshold=%s, last_updated=NOW()
        WHERE inventory_id=%s
    """, (
        item['quantity'],
        item.get('low_stock_threshold', 10),
        inventory_id
    ))
    mysql.connection.commit()
    cursor.close()

def delete_inventory(mysql, inventory_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Inventory WHERE inventory_id = %s", (inventory_id,))
    mysql.connection.commit()
    cursor.close()


def get_transactions(mysql):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT * FROM Transactions
    """)
    txns = cursor.fetchall()
    cursor.close()
    return txns

def add_transaction(mysql, txn):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO Transactions (product_id, user_id, transaction_type, quantity_change)
        VALUES (%s, %s, %s, %s)
    """, (
        txn['product_id'],
        txn['user_id'],
        txn['transaction_type'],
        txn['quantity_change']
    ))
    mysql.connection.commit()
    cursor.close()

def delete_transaction(mysql, transaction_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Transactions WHERE transaction_id=%s", (transaction_id,))
    mysql.connection.commit()
    cursor.close()


def get_alerts(mysql):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT Alerts.*, Inventory.product_id 
        FROM Alerts
        JOIN Inventory ON Alerts.inventory_id = Inventory.inventory_id
    """)
    alerts = cursor.fetchall()
    cursor.close()
    return alerts

def add_alert(mysql, alert):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO Alerts (inventory_id, alert_type, message, is_active)
        VALUES (%s, %s, %s, %s)
    """, (
        alert['inventory_id'],
        alert['alert_type'],
        alert['message'],
        alert.get('is_active', True)
    ))
    mysql.connection.commit()
    cursor.close()

def update_alert(mysql, alert_id, alert):
    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE Alerts SET is_active=%s, message=%s
        WHERE alert_id=%s
    """, (
        alert['is_active'],
        alert.get('message', ''),
        alert_id
    ))
    mysql.connection.commit()
    cursor.close()

def delete_alert(mysql, alert_id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM Alerts WHERE alert_id=%s", (alert_id,))
    mysql.connection.commit()
    cursor.close()


from flask_login import UserMixin
from app import login_manager, mysql

class User(UserMixin):
    def __init__(self, user_id, username, role):
        self.id = user_id
        self.username = username
        self.role = role

def get_user_by_username(mysql, username):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT user_id, username, password_hash, role FROM Users WHERE username=%s", (username,))
    user_data = cursor.fetchone()
    cursor.close()
    if user_data:
        return {
            "user_id": user_data[0],
            "username": user_data[1],
            "password_hash": user_data[2],
            "role": user_data[3]
        }
    return None


@login_manager.user_loader
def load_user(user_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT user_id, username, role FROM Users WHERE user_id=%s", (user_id,))
    user_data = cursor.fetchone()
    cursor.close()
    if user_data:
        return User(user_data[0], user_data[1], user_data[2])
    return None
