# shop.nafij Backend API 🚀

Production-grade, modular, high-performance REST API backend for the **shop.nafij** Digital Subscriptions platform. Built with Node.js, Express.js (ES Modules), MongoDB (Mongoose), and Cloudinary v2 image management.

Designed to seamlessly serve the Next.js 15 frontend with optimal caching, validated payloads, and standardized responses.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4+) with Modern ES Modules (`type: module`)
- **Database:** MongoDB with Mongoose ODM
- **Media Storage:** Cloudinary (v2) with Multer memory stream upload
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, Express-Rate-Limit
- **Logging & Utilities:** Morgan, Custom ApiError, Standardized ApiResponse, AsyncHandler

---

## 📁 Project Architecture

```
shop-nafij-backend/
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection with reconnect & graceful shutdown
│   │   └── cloudinary.js             # Cloudinary SDK configuration & credential validation
│   ├── controllers/
│   │   ├── product.controller.js      # Public storefront controllers (list, slug lookup)
│   │   └── adminProduct.controller.js # Admin CRUD controllers (create, update, toggle, delete)
│   ├── middlewares/
│   │   ├── multer.middleware.js       # Memory buffer storage & image MIME validation (5MB max)
│   │   ├── validate.middleware.js     # Zod schema validation middleware
│   │   ├── errorHandler.middleware.js # Centralized error handler with strict JSON payload
│   │   └── notFound.middleware.js     # 404 Route interceptor
│   ├── models/
│   │   └── Product.js                 # Mongoose model, virtuals (discount %), indexes
│   ├── routes/
│   │   ├── product.routes.js          # /api/products
│   │   ├── admin.routes.js            # /api/admin/products
│   │   └── index.js                   # Main route aggregator & /api/health
│   ├── utils/
│   │   ├── apiError.js                # Custom ApiError with HTTP status helpers
│   │   ├── apiResponse.js             # Standardized { success, statusCode, message, data }
│   │   ├── asyncHandler.js            # Try-catch eliminator for Express routes
│   │   ├── cloudinaryHelper.js        # Stream buffer upload and asset destruction
│   │   └── slugify.js                 # URL slug generator with collision resolution
│   ├── validators/
│   │   └── product.validator.js       # Zod schemas for Create, Update, and Queries
│   ├── scripts/
│   │   └── seedProducts.js            # Seeding script for 5 verified digital products
│   ├── app.js                         # Express configuration, CORS, rate limits
│   └── server.js                      # Server bootstrap and graceful shutdown handler
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000,https://shop.nafij.com
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shop_nafij?retryWrites=true&w=majority

# Cloudinary Credentials (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Products
Populates the database with the 5 verified digital subscriptions:
- Canva Pro Subscription (৳150 / ৳350)
- ChatGPT Plus [GPT-4o & o1] (৳650 / ৳1100)
- Google Gemini Advanced [2TB] (৳550 / ৳900)
- YouTube Premium & Music (৳150 / ৳300)
- Google Antigravity AI IDE (৳500 / ৳950)

```bash
npm run seed
```

### 3. Start Development Server (with auto-reload)
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

The server will be running at `http://localhost:5000`.

---

## 📡 API Reference

### Standardized Response Contract

#### Success (HTTP 200/201):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

#### Error (HTTP 4xx/5xx):
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product with slug 'canva-pro' not found",
  "errors": []
}
```

---

### A. Public Storefront Endpoints (`/api/products`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/products` | Get all active products | `search`, `sort` (`newest`, `oldest`, `price_asc`, `price_desc`), `page`, `limit` |
| `GET` | `/api/products/:slug` | Get single product by unique slug | None |

#### Example: Search & Sort
```http
GET /api/products?search=canva&sort=price_asc&page=1&limit=10
```

---

### B. Admin Management Endpoints (`/api/admin/products`)

| Method | Endpoint | Description | Content-Type |
|---|---|---|---|
| `GET` | `/api/admin/products` | Get all products (active & inactive) with metadata | `application/json` |
| `GET` | `/api/admin/products/:id` | Get single product by MongoDB `_id` | `application/json` |
| `POST` | `/api/admin/products` | Create new product with optional image file upload | `multipart/form-data` or `application/json` |
| `PUT` | `/api/admin/products/:id` | Update product details & replace image | `multipart/form-data` or `application/json` |
| `PATCH` | `/api/admin/products/:id/status`| Toggle active/inactive status | `application/json` |
| `DELETE` | `/api/admin/products/:id` | Delete product & destroy Cloudinary media asset | `application/json` |

#### Create Product (Multipart Form):
```http
POST /api/admin/products
Content-Type: multipart/form-data

Fields:
- name: "Spotify Premium Family"
- price: 120
- originalPrice: 240
- badge: "3 Months"
- description: "High-fidelity ad-free audio streaming with offline downloads."
- image: (Binary file attachment)
```

#### Toggle Status (PATCH):
```http
PATCH /api/admin/products/650f9a2b8e4e9b0012c4e8a1/status
Content-Type: application/json

{} # Toggles between active and inactive automatically
```

---

### C. Health Check

```http
GET /api/health
```

Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "shop.nafij API is operating smoothly",
  "data": {
    "status": "ok",
    "timestamp": "2026-10-05T14:18:00.000Z",
    "uptime": 142.3,
    "environment": "development"
  }
}
```

---

## 💻 Next.js 15 Integration Example

In your Next.js 15 `app` directory:

```tsx
// app/products/page.tsx
interface Product {
  _id: string;
  name: string;
  slug: string;
  badge?: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  description: string;
  isActive: boolean;
}

export default async function ProductsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    next: { revalidate: 60 }, // ISR cache for 60 seconds
  });

  const json = await res.json();
  const products: Product[] = json.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="border rounded-2xl p-4">
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl" />
          <h3 className="font-bold text-lg mt-2">{product.name}</h3>
          {product.badge && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">{product.badge}</span>}
          <div className="flex gap-2 items-center mt-3">
            <span className="text-xl font-bold">৳{product.price}</span>
            {product.originalPrice && (
              <span className="line-through text-gray-400">৳{product.originalPrice}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 Security & Best Practices Implemented

1. **Memory Storage Buffer for Multer:** Prevents local disk accumulation of orphan upload files. Direct streaming to Cloudinary via Node.js streams.
2. **Cloudinary Asset Lifecycle Management:** Automatically deletes old Cloudinary image assets when a product image is updated or when the product is deleted.
3. **Collision-Proof Slugs:** Built-in `generateUniqueSlug` automatically appends counters if product names match existing entries.
4. **Zod Runtime Type Coercion:** Handles multipart form-data type conversions (`string` -> `number`, `"true"` -> `true`) seamlessly before Mongoose queries.
5. **Rate Limiting:** Protects against abuse and DDoS attempts.
6. **Centralized Error Boundary:** Catches Mongoose duplicate key errors (11000), CastErrors, and Multer file limits with uniform JSON responses.
7. **Graceful Process Shutdown:** Handles `SIGINT` and `SIGTERM` by closing the HTTP server and disconnecting MongoDB cleanly.
