<<<<<<< HEAD
# B2B Merchant Network - Backend REST API

A scalable, clean MVC Node.js / Express / MongoDB backend designed to integrate with the B2B Merchant Network frontend.

---

## Architecture Overview

```
backend/
├── src/
│   ├── config/          # Database & Swagger configurations
│   ├── controllers/     # Thin controllers handling HTTP requests
│   ├── middleware/      # Auth (JWT), RBAC authorization, Validation, Centralized Error Handling
│   ├── models/          # Mongoose Schemas (User, Inventory, Movement, Procurement, Resale, Logistics, Transactions)
│   ├── routes/          # Express route definitions with dual frontend/backend compatibility
│   ├── seed/            # Demo database seed script (Admin, Merchants, Suppliers, Products, Orders)
│   ├── services/        # Core business logic (Procurement Engine, Demand Aggregation, Supplier Selection, M2M Resale, Analytics)
│   ├── utils/           # API response helpers, token generator, constants
│   ├── validators/      # express-validator schemas
│   ├── app.js           # Express app setup with Helmet, CORS, Morgan, Swagger UI
│   └── server.js        # Server listener
├── tests/               # Automated Jest & Supertest suites
├── .env.example
├── package.json
└── README.md
```

---

## User Roles & Credentials (Seed Data)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `password123` | Platform oversight & consolidated order management |
| **Merchant** | `merchant@demo.com` | `password123` | Demo Merchant (Inventory, Procurement, Resale) |
| **Merchant** | `citycorner@demo.com` | `password123` | City Corner Store |
| **Merchant** | `greenbasket@demo.com` | `password123` | Green Basket Groceries |
| **Supplier** | `supplier@demo.com` | `password123` | Demo Wholesale Supplier |
| **Supplier** | `freshmart@demo.com` | `password123` | FreshMart Agritech |
| **Supplier** | `national@demo.com` | `password123` | National Bulk Distributors |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure your MongoDB URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/merchant_network
JWT_SECRET=super_secret_merchant_network_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
Development mode with live reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 5. Run Test Suite
```bash
npm test
```

---

## Interactive Swagger API Documentation

When the server is running, visit:
**`http://localhost:5000/api-docs`**

---

## Key API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register merchant or supplier
- `POST /api/auth/login` - Authenticate and obtain JWT
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/logout` - Logout session

### Inventory
- `GET /api/inventory` - List merchant's inventory items
- `GET /api/inventory/:id` - Get inventory item details
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PATCH /api/inventory/:id/quantity` - Adjust stock with movement tracking
- `GET /api/inventory/alerts/low-stock` - Low stock alert items
- `GET /api/inventory/alerts/slow-moving` - Slow moving alert items
- `GET /api/inventory/analytics` - Inventory valuation & category breakdown

### Procurement Engine
- `GET /api/procurement/products` - Browse catalog of supplier products
- `GET /api/procurement/products/:id` - Single supplier product details
- `POST /api/payments/commitment` - Process simulated 10% commitment deposit
- `POST /api/procurement/requests` (and `/request`) - Create procurement request
- `GET /api/procurement/requests` (and `/orders`) - List procurement requests
- `PATCH /api/procurement/requests/:id/cancel` - Cancel procurement request
- `GET /api/procurement/aggregate` - Pooled demand aggregation
- `GET /api/procurement/suppliers` - Candidate supplier offers for product
- `POST /api/procurement/select-supplier` - Deterministic supplier selection

### Merchant-to-Merchant Resale
- `GET /api/resale/listings` - Browse active marketplace resale listings
- `GET /api/resale/listings/my` - Merchant's own listings
- `POST /api/resale/listings` - Create resale listing
- `PUT /api/resale/listings/:id` - Update resale listing
- `DELETE /api/resale/listings/:id` - Delete resale listing
- `POST /api/resale/requests` (and `/orders`) - Purchase excess stock listing
- `GET /api/resale/requests` (and `/orders`) - List resale orders
- `PATCH /api/resale/requests/:id/cancel` - Cancel resale order

### Supplier Management
- `GET /api/supplier/products` - List supplier products
- `POST /api/supplier/products` - Create supplier product
- `PUT /api/supplier/products/:id` - Update supplier product
- `DELETE /api/supplier/products/:id` - Delete supplier product
- `GET /api/supplier/orders` - View orders assigned to supplier
- `PATCH /api/supplier/orders/:id/status` - Transition order status (`accepted`, `preparing`, `completed`)

### Admin Management
- `GET /api/admin/dashboard` - Platform KPIs & aggregated metrics
- `GET /api/admin/suppliers` - List all suppliers with product/order counts
- `GET /api/admin/procurement` - All procurement requests across merchants
- `GET /api/admin/procurement/supplier-offers` - Compare supplier quotes
- `POST /api/admin/procurement/supplier-order` - Execute consolidated supplier order
- `GET /api/admin/orders` - Comprehensive order history
- `GET /api/admin/logistics` - Platform shipments tracking

### Logistics & Recommendations
- `GET /api/logistics` - List shipments
- `GET /api/logistics/:id` - Shipment tracking details
- `PATCH /api/logistics/:id/status` - Update delivery status
- `GET /api/recommendations/procurement` - AI-ready procurement recommendation rules
- `GET /api/recommendations/resale` - AI-ready liquidation & resale suggestions
=======
# Nexora-Backend
>>>>>>> 5f9dd9b0cff1d036a9895650660f9cf50bdfed31
