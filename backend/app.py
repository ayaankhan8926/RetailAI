from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import pandas as pd
from sklearn.cluster import KMeans
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "retailai_db"),
        port=int(os.getenv("DB_PORT", "3306"))
    )
    return conn
@app.route('/')
def home():
    return "RetailAI Backend is running!"

# ---------- products ----------
@app.route('/products', methods=['GET'])
def get_products():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_id, p.shop_id, p.product_name, p.category_id, p.brand, p.size, p.color, p.cost_price, p.selling_price, p.barcode, COALESCE(i.quantity, 0) AS stock_quantity, COALESCE(i.reorder_level, 5) AS reorder_level
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@app.route('/products', methods=['POST'])
def add_product():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO products (product_name, category_id, brand, size, color, cost_price, selling_price, supplier_id, shop_id, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data['product_name'], data['category_id'], data['brand'],
        data['size'], data['color'], data['cost_price'],
        data['selling_price'], data['supplier_id'], data.get('shop_id', 1),
        data.get('image_url')
    ))
    new_id = cursor.lastrowid
    custom_barcode = data.get('barcode')
    barcode = custom_barcode if custom_barcode else ('890' + str(new_id).zfill(9))
    cursor.execute("UPDATE products SET barcode = %s WHERE product_id = %s", (barcode, new_id))

    cursor.execute("""
        INSERT INTO inventory (product_id, quantity, reorder_level)
        VALUES (%s, %s, %s)
    """, (new_id, 0, 5))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product added successfully", "product_id": new_id, "barcode": barcode}), 201

@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE products SET
                product_name = %s, brand = %s, size = %s, color = %s,
                cost_price = %s, selling_price = %s, image_url = %s, barcode = %s
            WHERE product_id = %s
        """, (
            data['product_name'], data['brand'], data['size'], data['color'],
            data['cost_price'], data['selling_price'], data.get('image_url'),
            data.get('barcode'), product_id
        ))
        conn.commit()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/products/barcode/<barcode>', methods=['GET'])
def get_product_by_barcode(barcode):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products WHERE barcode = %s", (barcode,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    if product:
        return jsonify(product)
    else:
        return jsonify({"message": "Product not found"}), 404

@app.route('/products/<int:product_id>/image', methods=['GET'])
def get_product_image(product_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT image_url FROM products WHERE product_id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    if product and product.get('image_url'):
        return jsonify({'image_url': product['image_url']})
    return jsonify({'image_url': None}), 404

# ---------- CUSTOMERS ----------
@app.route('/customers', methods=['GET'])
def get_customers():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customer WHERE shop_id = %s", (shop_id,))
    customers = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(customers)

@app.route('/customers', methods=['POST'])
def add_customer():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO customer (name, phone, email, address, shop_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (data['name'], data['phone'], data.get('email'), data.get('address'), data.get('shop_id', 1)))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({"message": "customer added successfully", "customer_id": new_id}), 201

# ---------- inventory ----------
@app.route('/inventory', methods=['GET'])
def get_inventory():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT i.inventory_id, i.product_id, p.product_name, p.brand, p.size, p.color,
               i.quantity, i.reorder_level
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    inventory = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(inventory)

@app.route('/inventory/restock', methods=['POST'])
def restock_inventory():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE inventory SET quantity = quantity + %s
            WHERE product_id = %s
        """, (data['quantity'], data['product_id']))
        conn.commit()
        return jsonify({"message": "Stock updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- admin LOGIN ----------
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admin WHERE email = %s AND password = %s",
                   (data['email'], data['password']))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()
    if admin:
        return jsonify({
            "message": "Login successful",
            "admin_id": admin['admin_id'],
            "name": admin['name'],
            "shop_id": admin['shop_id']
        })
    else:
        return jsonify({"message": "Invalid email or password"}), 401

# ---------- employee LOGIN ----------
@app.route('/employee/login', methods=['POST'])
def employee_login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employee WHERE email = %s AND password = %s",
                   (data['email'], data['password']))
    employee = cursor.fetchone()
    cursor.close()
    conn.close()
    if employee:
        return jsonify({
            "message": "Login successful",
            "employee_id": employee['employee_id'],
            "name": employee['name'],
            "role": employee['role'],
            "shop_id": employee['shop_id']
        })
    else:
        return jsonify({"message": "Invalid email or password"}), 401

# ---------- employee MANAGEMENT ----------
@app.route('/employees', methods=['GET'])
def get_employees():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT employee_id, name, email, phone, role, joining_date, status FROM employee WHERE shop_id = %s", (shop_id,))
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(employees)

@app.route('/employees', methods=['POST'])
def add_employee():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO employee (name, email, password, phone, role, joining_date, status, shop_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['name'], data['email'], data['password'], data['phone'],
            data['role'], data['joining_date'], 'Active', data.get('shop_id', 1)
        ))
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"message": "employee added successfully", "employee_id": new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- shop SIGNUP ----------
@app.route('/shop/signup', methods=['POST'])
def shop_signup():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM shop WHERE owner_email = %s", (data['owner_email'],))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"message": "A shop with this email already exists"}), 400

        cursor.execute("""
            INSERT INTO shop (shop_name, owner_name, owner_email)
            VALUES (%s, %s, %s)
        """, (data['shop_name'], data['owner_name'], data['owner_email']))
        new_shop_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO admin (name, email, password, phone, shop_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['owner_name'], data['owner_email'], data['password'], data.get('phone', ''), new_shop_id))

        conn.commit()
        return jsonify({"message": "shop created successfully", "shop_id": new_shop_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- BILLS ----------
@app.route('/bills', methods=['GET'])
def get_bills():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT b.bill_id, c.name AS customer_name, e.name AS employee_name,
               b.bill_date, b.total_amount, b.payment_mode
        FROM bill b
        LEFT JOIN customer c ON b.customer_id = c.customer_id
        LEFT JOIN employee e ON b.employee_id = e.employee_id
        WHERE b.shop_id = %s
    """, (shop_id,))
    bills = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(bills)

@app.route('/bills', methods=['POST'])
def create_bill():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Validate stock for every item BEFORE creating the bill
        for item in data['items']:
            cursor.execute("SELECT quantity FROM inventory WHERE product_id = %s", (item['product_id'],))
            row = cursor.fetchone()
            available = row['quantity'] if row else 0
            if item['quantity'] > available:
                return jsonify({"error": "Not enough stock for product_id " + str(item['product_id']) + ". Available: " + str(available) + ", requested: " + str(item['quantity'])}), 400

        cursor2 = conn.cursor()
        cursor2.execute("""
            INSERT INTO bill (customer_id, employee_id, subtotal, discount_amount, gst_amount, total_amount, payment_mode, shop_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['customer_id'], data['employee_id'], data['subtotal'],
            data.get('discount_amount', 0), data['gst_amount'],
            data['total_amount'], data.get('payment_mode', 'Cash'), data.get('shop_id', 1)
        ))
        bill_id = cursor2.lastrowid

        for item in data['items']:
            cursor2.execute("""
                INSERT INTO sales (bill_id, product_id, quantity, price_at_sale)
                VALUES (%s, %s, %s, %s)
            """, (bill_id, item['product_id'], item['quantity'], item['price_at_sale']))

            cursor2.execute("""
                UPDATE inventory SET quantity = quantity - %s
                WHERE product_id = %s
            """, (item['quantity'], item['product_id']))

        conn.commit()
        return jsonify({"message": "bill created successfully", "bill_id": bill_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- DISCOUNTS ----------
@app.route('/discounts', methods=['GET'])
def get_discounts():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT d.discount_id, p.product_name, d.discount_type, d.discount_value,
               d.start_date, d.end_date, d.status
        FROM discount d
        LEFT JOIN products p ON d.product_id = p.product_id
        WHERE d.shop_id = %s
    """, (shop_id,))
    discounts = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(discounts)

@app.route('/discounts', methods=['POST'])
def add_discount():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO discount (product_id, discount_type, discount_value, start_date, end_date, status, shop_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        data.get('product_id'), data['discount_type'], data['discount_value'],
        data['start_date'], data['end_date'], data.get('status', 'Active'), data.get('shop_id', 1)
    ))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({"message": "discount added successfully", "discount_id": new_id}), 201

# ---------- RETURNS / EXCHANGE ----------
@app.route('/returns', methods=['GET'])
def get_returns():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.return_id, r.bill_id, p1.product_name AS returned_product,
               p2.product_name AS exchanged_for, r.type, r.reason, r.refund_amount, r.return_date
        FROM return_exchange r
        LEFT JOIN products p1 ON r.product_id = p1.product_id
        LEFT JOIN products p2 ON r.exchanged_product_id = p2.product_id
        WHERE r.shop_id = %s
    """, (shop_id,))
    returns = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(returns)

@app.route('/returns', methods=['POST'])
def create_return():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO return_exchange (bill_id, product_id, type, exchanged_product_id, reason, refund_amount, shop_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['bill_id'], data['product_id'], data['type'],
            data.get('exchanged_product_id'), data.get('reason', ''), data.get('refund_amount', 0), data.get('shop_id', 1)
        ))

        cursor.execute("""
            UPDATE inventory SET quantity = quantity + 1
            WHERE product_id = %s
        """, (data['product_id'],))

        if data['type'] == 'Exchange' and data.get('exchanged_product_id'):
            cursor.execute("""
                UPDATE inventory SET quantity = quantity - 1
                WHERE product_id = %s
            """, (data['exchanged_product_id'],))

        conn.commit()
        return jsonify({"message": "Return/Exchange recorded successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- AI: BEST SELLER PREDICTION ----------
@app.route('/ai/best-seller', methods=['GET'])
def best_seller():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.brand, p.color, p.size, s.quantity
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return jsonify({"message": "Not enough sales data yet"}), 200

    df = pd.DataFrame(rows)
    top_brand = df.groupby('brand')['quantity'].sum().idxmax()
    top_color = df.groupby('color')['quantity'].sum().idxmax()
    top_size = df.groupby('size')['quantity'].sum().idxmax()

    result = {
        "top_brand": top_brand,
        "top_color": top_color,
        "top_size": top_size
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('BestSeller', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

# ---------- AI: SLOW MOVING / DEAD STOCK ----------
@app.route('/ai/slow-moving', methods=['GET'])
def slow_moving():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_id, p.product_name, p.brand, i.quantity AS stock_left,
               COALESCE(SUM(s.quantity), 0) AS total_sold
        FROM products p
        JOIN inventory i ON p.product_id = i.product_id
        LEFT JOIN sales s ON p.product_id = s.product_id
        WHERE p.shop_id = %s
        GROUP BY p.product_id, p.product_name, p.brand, i.quantity
    """, (shop_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return jsonify({"message": "No product data available"}), 200

    df = pd.DataFrame(rows)
    slow_moving_df = df[df['total_sold'] <= 1]
    result = slow_moving_df.to_dict(orient='records')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('SlowMoving', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

# ---------- AI: DEMAND PREDICTION ----------
@app.route('/ai/demand-prediction', methods=['GET'])
def demand_prediction():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.product_id, p.product_name, p.brand,
               s.quantity, s.sale_date
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return jsonify({"message": "Not enough sales data yet"}), 200

    df = pd.DataFrame(rows)
    df['sale_date'] = pd.to_datetime(df['sale_date'])

    min_date = df['sale_date'].min()
    max_date = df['sale_date'].max()
    days_span = max((max_date - min_date).days, 1)

    grouped = df.groupby(['product_id', 'product_name', 'brand'])['quantity'].sum().reset_index()
    grouped['daily_rate'] = grouped['quantity'] / days_span
    grouped['predicted_demand_next_30_days'] = (grouped['daily_rate'] * 30).round(0)

    result = grouped[['product_id', 'product_name', 'brand', 'predicted_demand_next_30_days']].to_dict(orient='records')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('Demand', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

# ---------- AI: SMART REORDER RECOMMENDATION ----------
@app.route('/ai/reorder-recommendation', methods=['GET'])
def reorder_recommendation():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.product_id, p.product_name, p.brand,
               s.quantity, s.sale_date
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    sales_rows = cursor.fetchall()

    cursor.execute("""
        SELECT i.product_id, i.quantity AS current_stock, i.reorder_level
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    inventory_rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not sales_rows:
        return jsonify({"message": "Not enough sales data yet"}), 200

    df = pd.DataFrame(sales_rows)
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    min_date = df['sale_date'].min()
    max_date = df['sale_date'].max()
    days_span = max((max_date - min_date).days, 1)

    grouped = df.groupby(['product_id', 'product_name', 'brand'])['quantity'].sum().reset_index()
    grouped['daily_rate'] = grouped['quantity'] / days_span
    grouped['predicted_demand_next_30_days'] = (grouped['daily_rate'] * 30).round(0)

    inv_df = pd.DataFrame(inventory_rows)
    merged = grouped.merge(inv_df, on='product_id', how='left')
    merged['current_stock'] = merged['current_stock'].fillna(0)
    merged['reorder_level'] = merged['reorder_level'].fillna(5)

    merged['reorder_needed'] = merged['predicted_demand_next_30_days'] > merged['current_stock']
    merged['recommended_order_qty'] = (
        merged['predicted_demand_next_30_days'] - merged['current_stock']
    ).clip(lower=0).round(0)

    result_df = merged[merged['reorder_needed'] == True][
        ['product_id', 'product_name', 'brand', 'current_stock',
         'predicted_demand_next_30_days', 'recommended_order_qty']
    ]

    result = result_df.to_dict(orient='records')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('Reorder', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

# ---------- AI: PROFIT PREDICTION ----------
@app.route('/ai/profit-prediction', methods=['GET'])
def profit_prediction():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.quantity, s.price_at_sale, s.sale_date, p.cost_price
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        WHERE p.shop_id = %s
    """, (shop_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return jsonify({"message": "Not enough sales data yet"}), 200

    df = pd.DataFrame(rows)
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    df['profit'] = (df['price_at_sale'] - df['cost_price']) * df['quantity']

    total_profit_so_far = df['profit'].sum()

    min_date = df['sale_date'].min()
    max_date = df['sale_date'].max()
    days_span = max((max_date - min_date).days, 1)

    daily_profit_rate = total_profit_so_far / days_span
    predicted_monthly_profit = round(daily_profit_rate * 30, 2)

    result = {
        "total_profit_so_far": round(float(total_profit_so_far), 2),
        "predicted_monthly_profit": float(predicted_monthly_profit)
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('Profit', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

# ---------- AI: customer SEGMENTATION ----------
@app.route('/ai/customer-segmentation', methods=['GET'])
def customer_segmentation():
    shop_id = request.args.get('shop_id', 1)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT b.customer_id, c.name,
               COUNT(b.bill_id) AS total_purchases,
               COALESCE(SUM(b.total_amount), 0) AS total_spent
        FROM bill b
        JOIN customer c ON b.customer_id = c.customer_id
        WHERE b.shop_id = %s
        GROUP BY b.customer_id, c.name
    """, (shop_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if len(rows) < 3:
        return jsonify({"message": "Not enough customer data yet for segmentation (need at least 3 customers with purchases)"}), 200

    df = pd.DataFrame(rows)
    X = df[['total_purchases', 'total_spent']]

    kmeans = KMeans(n_clusters=min(3, len(df)), random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X)

    cluster_avg_spend = df.groupby('cluster')['total_spent'].mean().sort_values(ascending=False)
    labels = ['Frequent', 'Occasional', 'One-time']
    cluster_label_map = {cluster: labels[i] for i, cluster in enumerate(cluster_avg_spend.index)}
    df['segment'] = df['cluster'].map(cluster_label_map)

    conn = get_db_connection()
    cursor = conn.cursor()
    for _, row in df.iterrows():
        cursor.execute("UPDATE customer SET segment = %s WHERE customer_id = %s",
                       (row['segment'], row['customer_id']))
    conn.commit()

    result = df[['customer_id', 'name', 'total_purchases', 'total_spent', 'segment']].to_dict(orient='records')
    cursor.execute("INSERT INTO ai_prediction (prediction_type, result_value, shop_id) VALUES (%s, %s, %s)",
                   ('Segmentation', str(result), shop_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(result)

@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM inventory WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
        conn.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)



