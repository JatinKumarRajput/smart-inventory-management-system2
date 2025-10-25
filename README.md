# Smart Inventory Management System

An intelligent inventory management system with AI/ML-powered features for demand forecasting, anomaly detection, and automated stock optimization.

## Features

### Core Functionality
- **Product Management**: Complete CRUD operations for products and suppliers
- **Real-time Inventory Tracking**: Live stock level monitoring with automated alerts
- **Transaction Management**: Track purchases, sales, and adjustments with automatic inventory updates
- **User Authentication**: Role-based access control (Admin/Staff)
- **Alert System**: Customizable low-stock and anomaly alerts

### Dashboard Analytics
- Interactive visualizations with Recharts
- Inventory status distribution (Pie Chart)
- Product category breakdown (Pie Chart)
- Transaction trends over time (Line Chart)
- Low stock products overview (Bar Chart)

### AI/ML Features (Planned)
- Demand forecasting using historical transaction data
- Anomaly detection for unusual inventory patterns
- Intelligent reorder point recommendations

## Tech Stack

### Backend
- **Flask** (Python web framework)
- **MySQL** (Database)
- **Flask-Login** (Authentication)
- **Flask-Bcrypt** (Password hashing)
- **Flask-CORS** (Cross-origin resource sharing)

### Frontend
- **React.js** (UI framework)
- **Material-UI (MUI)** (Component library)
- **Axios** (HTTP client)
- **React Router** (Navigation)
- **Recharts** (Data visualization)

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 8.0+

### Backend Setup

cd backend
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Create .env file
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=smart_inventory
SECRET_KEY=your_secret_key
python run.py

text

### Frontend Setup

cd frontend
npm install
npm start

text

### Database Setup

CREATE DATABASE smart_inventory;
USE smart_inventory;

-- Run schema.sql to create tables
-- Run sample_data.sql to populate initial data

text

## Project Structure

smart_inventory_system/
├── backend/
│ ├── app/
│ │ ├── init.py
│ │ ├── routes.py
│ │ └── models.py
│ ├── run.py
│ └── requirements.txt
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── services/
│ │ └── App.js
│ └── package.json
└── README.md

text

## Database Schema

- **Users**: Authentication and role management
- **Products**: Product information and pricing
- **Suppliers**: Supplier contact details
- **Inventory**: Real-time stock levels and thresholds
- **Transactions**: Purchase, sale, and adjustment history
- **Alerts**: Automated inventory notifications

## Usage

1. **Login** with credentials (default: testuser/TestPass123)
2. **Dashboard**: View key metrics and analytics
3. **Products**: Manage product catalog
4. **Suppliers**: Maintain supplier database
5. **Inventory**: Track and update stock levels
6. **Transactions**: Record stock movements
7. **Alerts**: Monitor and manage notifications

## Future Enhancements

- [ ] ML-based demand forecasting
- [ ] Anomaly detection algorithms
- [ ] PDF/Excel report generation
- [ ] Barcode scanning integration
- [ ] Multi-location inventory support
- [ ] Email notification system

## License

MIT License

## Author

[Your Name]
- GitHub: [JatinKumarRajput]
- LinkedIn: [www.linkedin.com/in/jatin-rajput-bb60372bb]
- Email: [jatinraj0000@gmail.com]
