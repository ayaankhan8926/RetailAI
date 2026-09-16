\# RetailAI — Smart Clothing Store Management System



RetailAI is a full-stack, AI-powered retail management platform built for clothing stores. It supports multi-shop tenancy, role-based staff access, real-time inventory, GST-compliant billing, barcode-based checkout, and 6 machine learning features for demand forecasting and business insights.



\## Tech Stack



\*\*Frontend:\*\* React (Vite), React Router, Recharts, Axios, JsBarcode, QRCode.react

\*\*Backend:\*\* Python, Flask, Flask-CORS

\*\*Database:\*\* MySQL

\*\*AI/ML:\*\* Pandas, Scikit-learn (K-Means Clustering)



\## Features



\- Multi-shop signup with fully isolated data per shop

\- Role-based login: Admin, and Employee (Salesperson / Cashier / Manager)

\- Product catalog with size and color variants, shared barcodes, image upload

\- Real-time inventory with low-stock alerts and one-click restock

\- Billing system with CGST/SGST split, GST slab rules, UPI QR / Card / Cash payment, printable GST invoices

\- Barcode scan-to-bill support

\- AI Dashboard: Best Seller Prediction, Demand Forecasting, Reorder Recommendations, Slow-Moving Stock Detection, Profit Prediction, Customer Segmentation (K-Means)

\- Discounts and Returns/Exchange management

\- CSV export for products, customers, and sales reports



\## Project Structure



RetailAI/

\- backend/ (Flask API + MySQL connection)

\- frontend/ (React Vite application)



\## Setup Instructions



\### 1. Database

\- Create a MySQL database named retailai\_db

\- Run the schema/setup SQL script found in backend/setup.sql



\### 2. Backend

\- cd backend

\- python -m venv venv

\- venv\\Scripts\\activate

\- pip install -r requirements.txt

\- Create a .env file in backend/ with: DB\_PASSWORD=your\_mysql\_password

\- Run: python app.py



\### 3. Frontend

\- cd frontend

\- npm install

\- npm run dev



App runs at http://localhost:5173, backend at http://127.0.0.1:5000.



\## Author

Built as a final year project.

