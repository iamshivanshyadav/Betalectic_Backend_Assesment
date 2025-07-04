# Checkout System API

A modular and extensible checkout system built with Node.js, TypeScript, Express.js, and Sequelize ORM that implements discount rules and provides a RESTful JSON API for managing products and shopping carts.

## 🚀 Features

- **Modular Architecture**: Built following SOLID principles with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Flexible Discount System**: Strategy pattern implementation for promotion rules
- **Database Integration**: MongoDB with Mongoose ODM
- **RESTful API**: Complete CRUD operations for products and cart management
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Docker Ready**: Containerization support for easy deployment

## 📋 Business Requirements

### Products
| Item | Price |
|------|-------|
| A    | Rs 30 |
| B    | Rs 20 |
| C    | Rs 50 |
| D    | Rs 15 |

### Promotion Rules
1. **Quantity Discount A**: 3 of Item A for Rs 85 (instead of Rs 90)
2. **Quantity Discount B**: 2 of Item B for Rs 35 (instead of Rs 40)
3. **Total Discount**: Rs 20 off when total basket price (after previous discounts) exceeds Rs 150

### Test Cases
| Basket            | Expected Price |
|-------------------|----------------|
| A, B, C           | Rs 100         |
| B, A, B, A, A     | Rs 120         |
| C, B, A, A, D, A, B | Rs 165       |
| C, A, D, A, A     | Rs 150         |

## 🏗️ Architecture

### Directory Structure
```
src/
├── controllers/        # API controllers (MVC pattern)
├── models/            # Database models (Sequelize)
├── services/          # Business logic layer
├── routes/            # Express route definitions
├── types/             # TypeScript type definitions
├── database/          # Database configuration and migrations
├── utils/             # Utility functions
└── __tests__/         # Test suites
```

### Design Patterns Used
- **Strategy Pattern**: For discount rules implementation
- **MVC Pattern**: For API structure
- **Repository Pattern**: For data access abstraction
- **Factory Pattern**: For rule creation
- **Dependency Injection**: For service management

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Testing**: Jest + Supertest
- **Documentation**: Swagger (planned)

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Products Endpoints

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "A",
      "name": "Product A",
      "price": "30.00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Products retrieved successfully"
}
```

#### Get Product by ID
```http
GET /api/products/{id}
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "id": "E",
  "name": "Product E",
  "price": 25
}
```

### Cart Endpoints

#### Create Cart
```http
POST /api/carts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "totalPrice": "0.00",
    "totalDiscount": "0.00",
    "finalPrice": "0.00"
  },
  "message": "Cart created successfully"
}
```

#### Add Item to Cart
```http
POST /api/carts/{cartId}/items
Content-Type: application/json

{
  "productId": "A",
  "quantity": 2
}
```

#### Get Cart
```http
GET /api/carts/{cartId}
```

#### Get Cart Summary with Discounts
```http
GET /api/carts/{cartId}/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "A",
        "productName": "Product A",
        "quantity": 3,
        "unitPrice": 30,
        "totalPrice": 90,
        "discountAmount": 5,
        "finalPrice": 85
      }
    ],
    "subtotal": 90,
    "totalDiscount": 5,
    "finalTotal": 85,
    "appliedDiscounts": [
      {
        "ruleId": "QuantityDiscountRule",
        "ruleName": "3 of A for Rs 85",
        "discountAmount": 5,
        "appliedTo": "ITEM",
        "itemId": "A"
      }
    ]
  },
  "message": "Cart summary retrieved successfully"
}
```

#### Remove Item from Cart
```http
DELETE /api/carts/{cartId}/items/{productId}
```

#### Clear Cart
```http
DELETE /api/carts/{cartId}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd checkout-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   # The MongoDB Atlas database is already configured
   # Run migrations (creates indexes)
   npm run migrate
   
   # Seed sample data
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run migrate     # Run database migrations
npm run seed        # Seed database with sample data
```

## 🗄️ Database Schema

### Products Collection
```typescript
{
  _id: ObjectId,
  id: String, // Custom identifier (A, B, C, D)
  name: String,
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Carts Collection
```typescript
{
  _id: ObjectId,
  totalPrice: Number,
  totalDiscount: Number,
  finalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Items Collection
```typescript
{
  _id: ObjectId,
  cartId: ObjectId, // Reference to carts collection
  productId: String, // Reference to products.id field
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  discountAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Connection
The system uses MongoDB Atlas with the following connection string:
```
mongodb+srv://hellboysy50:mGMh80ne8IAFte8X@cluster0.xqq3v7z.mongodb.net/checkout_system?retryWrites=true&w=majority
```

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm test -- --coverage    # Run tests with coverage report
```

### Test Coverage
The test suite includes:
- Unit tests for business logic
- Integration tests for API endpoints
- Database interaction tests
- Edge case handling tests

### Test Cases Covered
- ✅ Basic checkout functionality
- ✅ Quantity-based discount rules
- ✅ Total-based discount rules
- ✅ Multiple discount combinations
- ✅ All provided test scenarios
- ✅ Error handling and edge cases
- ✅ API endpoint validation
- ✅ Database operations

## 🔧 Core Implementation

### Checkout Interface
```typescript
interface ICheckout {
  scan(item: string): void;
  total(): number;
  totalDiscounts(): number;
  getItems(): Map<string, number>;
  getSummary(): CheckoutSummary;
}
```

### Usage Example
```typescript
import { Checkout } from './services/Checkout';
import { QuantityDiscountRule, TotalBasedDiscountRule } from './services/PromotionRule';

// Setup products and rules
const products = [
  { id: 'A', name: 'Product A', price: 30 },
  { id: 'B', name: 'Product B', price: 20 },
  { id: 'C', name: 'Product C', price: 50 },
  { id: 'D', name: 'Product D', price: 15 }
];

const rules = [
  new QuantityDiscountRule('A', 3, 85),
  new QuantityDiscountRule('B', 2, 35),
  new TotalBasedDiscountRule(150, 20)
];

// Create checkout instance
const checkout = new Checkout(rules, products);

// Scan items
checkout.scan('A');
checkout.scan('A');
checkout.scan('A');

// Get totals
const total = checkout.total();           // 85
const discounts = checkout.totalDiscounts(); // 5
```

## 🔄 Extending the System

### Adding New Discount Rules
1. Create a new class extending `PromotionRule`
2. Implement `isApplicable()` and `apply()` methods
3. Register the rule in the checkout system

```typescript
class NewDiscountRule extends PromotionRule {
  isApplicable(items: Map<string, number>, products: Map<string, Product>): boolean {
    // Implementation
  }

  apply(items: Map<string, number>, products: Map<string, Product>) {
    // Implementation
  }
}
```

### Adding New API Endpoints
1. Add route in `src/routes/index.ts`
2. Implement controller method
3. Add service layer logic if needed
4. Write tests

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Build the application: `npm run build`
4. Start with: `npm start`

### Docker Deployment
```bash
# Build image
docker build -t checkout-system .

# Run container
docker run -p 3000:3000 -e DB_HOST=your-db-host checkout-system
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🏷️ Git History

This repository follows conventional commits for clear git history:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/modifications
- `refactor:` Code refactoring

## 📞 Support

For support or questions, please create an issue in the repository.
