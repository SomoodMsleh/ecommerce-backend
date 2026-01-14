# 🛍️ E-Commerce Backend API

A production-ready, scalable e-commerce REST API built with Node.js, TypeScript, Express, and MongoDB.

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization**
  - JWT access tokens + Refresh tokens with Redis
  - Two-Factor Authentication (2FA) with Speakeasy
  - OAuth 2.0 (Google & Facebook)
  - Password hashing with bcrypt
  - Email verification & password reset

- ✅ **User Management**
  - User profiles with avatars (Cloudinary)
  - Multiple shipping addresses
  - Account deletion with 30-day recovery period
  - Password change with 2FA support

- ✅ **Product Management**
  - Full CRUD operations
  - Image upload (multiple images per product)
  - Categories & subcategories
  - Product variants & specifications
  - Stock management
  - Search, filter, and pagination

- ✅ **Shopping Experience**
  - Shopping cart with persistent storage
  - Wishlist functionality
  - Product reviews & ratings
  - Advanced search & filtering

- ✅ **Order Management**
  - Complete order lifecycle
  - Order tracking
  - Order cancellation with stock restoration
  - Order history with pagination

- ✅ **Payment Integration**
  - Stripe integration
  - PayPal integration
  - Webhook handling for payment status
  - Cash on delivery (COD)

- ✅ **Performance & Scalability**
  - Redis caching for products and categories
  - Bull queue for background jobs
  - Socket.io for real-time notifications
  - Rate limiting with Redis
  - Database indexing

- ✅ **Security**
  - Helmet.js security headers
  - CORS protection
  - Input validation with Joi
  - XSS protection
  - Rate limiting

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- Redis >= 7.0
- npm >= 9.0.0

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/SomoodMsleh/ecommerce-backend.git
cd ecommerce-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
APP_NAME=E-CommerceAPI
PORT=5000

# Database
DB_URL=mongodb://localhost:27017/ecommerce

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Client
CLIENT_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="E-Commerce API <your_email@gmail.com>"

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### 4. Run the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 🐳 Docker Setup

### Development
```bash
docker-compose -f docker/docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth` | Register new user | No |
| POST | `/auth/verifyEmail` | Verify email | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/forgetPassword` | Request password reset | No |
| POST | `/auth/resetPassword/:token` | Reset password | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/2fa/enable` | Enable 2FA | Yes |
| POST | `/auth/2fa/verify` | Verify 2FA setup | Yes |
| POST | `/auth/2fa/verify-login` | Verify 2FA at login | No |
| POST | `/auth/2fa/disable` | Disable 2FA | Yes |
| GET | `/auth/google` | Google OAuth | No |
| GET | `/auth/facebook` | Facebook OAuth | No |

#### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update profile | Yes |
| POST | `/users/avatar` | Upload avatar | Yes |
| DELETE | `/users/avatar` | Delete avatar | Yes |
| GET | `/users/addresses` | Get addresses | Yes |
| POST | `/users/addresses` | Add address | Yes |
| PUT | `/users/addresses/:addressId` | Update address | Yes |
| DELETE | `/users/addresses/:addressId` | Delete address | Yes |
| PUT | `/users/changePassword` | Change password | Yes |
| DELETE | `/users/account/delete` | Delete account | Yes |
| GET | `/users/account/restore/:token` | Restore account | No |

#### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get product by ID | No |
| GET | `/products/slug/:slug` | Get product by slug | No |
| POST | `/products` | Create product | Admin/Vendor |
| PUT | `/products/:id` | Update product | Admin/Vendor |
| DELETE | `/products/:id` | Delete product | Admin |

#### Categories
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | No |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

#### Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user cart | Yes |
| POST | `/cart` | Add item to cart | Yes |
| PUT | `/cart` | Update cart item | Yes |
| DELETE | `/cart/:productId` | Remove item from cart | Yes |
| DELETE | `/cart` | Clear cart | Yes |

#### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create order | Yes |
| GET | `/orders` | Get user orders | Yes |
| GET | `/orders/:id` | Get order by ID | Yes |
| PUT | `/orders/:id/cancel` | Cancel order | Yes |

#### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/stripe/create-intent` | Create Stripe payment | Yes |
| POST | `/payments/stripe/webhook` | Stripe webhook | No |
| POST | `/payments/paypal/create-order` | Create PayPal order | Yes |
| POST | `/payments/paypal/capture` | Capture PayPal payment | Yes |

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run unit tests
```bash
npm run test:unit
```

### Run integration tests
```bash
npm run test:integration
```

### Generate coverage report
```bash
npm run test:coverage
```

## 🔧 Development Tools

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatting
```bash
npm run format
```

## 🚀 Deployment

### AWS EC2 Deployment

1. **Setup EC2 Instance**
   - Launch Ubuntu 22.04 LTS instance
   - Configure security groups (ports 22, 80, 443, 5000)
   - Install Docker and Docker Compose

2. **Configure GitHub Secrets**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `EC2_HOST`
   - `EC2_USERNAME`
   - `EC2_SSH_KEY`

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - GitHub Actions builds Docker image
   - Deploys to EC2 via SSH

## 📊 Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middleware
│   ├── validators/      # Input validation
│   ├── utils/           # Utility functions
│   ├── jobs/            # Background jobs
│   ├── sockets/         # Socket.io events
│   ├── emailTemplates/  # Email templates
│   ├── app.ts           # Express app
│   └── server.ts        # Entry point
├── tests/               # Test files
├── docker/              # Docker configuration
├── .github/             # GitHub Actions
└── docs/                # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Somood Musleh**
- GitHub: [@SomoodMsleh](https://github.com/SomoodMsleh)

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the database
- All contributors to the open-source packages used in this project