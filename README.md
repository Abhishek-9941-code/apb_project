# APB Official - E-Commerce Marketplace

A full-stack e-commerce platform built with Node.js and Express, featuring role-based user authentication, dynamic product management, customer reviews, and shopping cart functionality.

## Overview

APB Official is a modern web-based marketplace application that connects product owners with customers. The platform enables owners to manage product listings with image uploads, while customers can browse products, leave reviews with ratings, track favorites, and build shopping carts. The application provides a seamless shopping experience with personalized product recommendations including new arrivals and top-rated items.

## Features

- **User Authentication & Authorization**
  - User registration and login with Passport.js
  - Role-based access control (Customer/Owner)
  - Secure session management with cookie-based persistence
  - Flash notifications for user feedback

- **Product Management**
  - Browse all products with category organization
  - View new arrivals sorted by creation date
  - Discover top-rated products sorted by customer ratings
  - Search and filter products
  - Product detail pages with related product recommendations
  - Owner-exclusive features: Add and edit product listings
  - Track product availability and inventory status
  - Display original and selling prices with sales tracking

- **Customer Reviews & Ratings**
  - Leave detailed reviews with 1-5 star ratings
  - View all reviews on product detail pages
  - Review moderation with delete functionality
  - Automatic rating calculation based on user reviews
  - Review timestamps and owner attribution

- **Shopping Cart**
  - Add items to persistent shopping carts
  - View cart with product quantity management
  - Session-based cart storage for authenticated users

- **Image Management**
  - Upload product images via Multer
  - Cloud storage integration with Cloudinary
  - Support for multiple image formats (PNG, JPEG, JPG)
  - Optimized image serving for faster load times

- **User Experience**
  - Responsive EJS template-based views with layout inheritance
  - Real-time flash notifications for actions
  - Current user information in session
  - Product availability indicators
  - Related products suggestions on detail pages

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Runtime** | Node.js |
| **Backend Framework** | Express.js (v5.2.1) |
| **Frontend** | EJS Templating Engine, ejs-mate |
| **Database** | MongoDB |
| **ORM/ODM** | Mongoose (v9.6.1) |
| **Authentication** | Passport.js, passport-local, passport-local-mongoose |
| **File Upload** | Multer (v2.1.1), multer-storage-cloudinary |
| **Cloud Storage** | Cloudinary (v2.10.0) |
| **Validation** | Joi (v18.2.1) |
| **Session Management** | express-session |
| **Notifications** | connect-flash |
| **HTTP Utilities** | method-override, cookie-parser |
| **Styling** | CSS |
| **Package Manager** | npm |

## Project Architecture

```
Frontend (EJS Templates)
         ↓
Express Routes & Middleware
         ↓
Controllers (Business Logic)
         ↓
Mongoose Models (Schema Definition)
         ↓
MongoDB Database
```

**Data Flow**:
1. Client requests handled by Express routes
2. Authentication middleware validates user session
3. Route handlers call controllers for business logic
4. Controllers interact with Mongoose models
5. Models perform database operations on MongoDB
6. File uploads processed by Multer and stored in Cloudinary
7. Views rendered with EJS templates and returned to client

## Project Structure

```
apb-official/
├── app.js                          # Application entry point & server configuration
├── middleware.js                   # Authentication & authorization middleware
├── schema.js                       # Joi validation schemas
├── cloudConfig.js                  # Cloudinary configuration
├── ExpressError.js                 # Custom error handling
├── package.json                    # Project dependencies & metadata
│
├── models/                         # Mongoose database schemas
│   ├── user.js                     # User model with Passport.js integration
│   ├── product.js                  # Product model with reviews reference
│   ├── review.js                   # Review model with owner reference
│   └── order.js                    # Order model (basic structure)
│
├── controllers/                    # Business logic handlers
│   ├── login.js                    # Login controller
│   └── signup_route.js             # Signup controller
│
├── routes/                         # Express route definitions
│   ├── login_route.js              # Login routes
│   ├── signup_route.js             # Signup routes
│   ├── homeRoutes.js               # Home & product listing routes
│   ├── productRoutes.js            # Product CRUD & review operations
│   ├── product_detail.js           # Product detail & edit routes
│   └── debugRoutes.js              # Debug/utility routes
│
├── views/                          # EJS template files
│   ├── layout/                     # Layout templates
│   ├── include/                    # Reusable template components
│   ├── sign_up/                    # Authentication templates
│   └── listing/                    # Product listing templates
│       ├── home.ejs                # Home page with featured products
│       ├── product_detail.ejs      # Individual product detail view
│       ├── addproduct.ejs          # Add product form (owner only)
│       ├── edit_product.ejs        # Edit product form (owner only)
│       ├── cart.ejs                # Shopping cart view
│       ├── top_products.ejs        # All products listing
│       ├── new_arrivals.ejs        # New products sorted by date
│       ├── most_rated.ejs          # Top-rated products
│       ├── search_results.ejs      # Search results page
│       └── invoice.ejs             # Order invoice template
│
├── public/                         # Static assets
│   ├── css/                        # Stylesheets
│   │   ├── home.css                # Home page styles
│   │   ├── product_detail.css      # Product detail styles
│   │   ├── cart.css                # Cart page styles
│   │   ├── add_top_product.css     # Product form styles
│   │   ├── login.css               # Login/auth styles
│   │   └── rating.css              # Review rating styles
│   │
│   ├── js/                         # Client-side JavaScript
│   │   ├── home.js                 # Home page interactions
│   │   ├── product_detail.js       # Product detail page logic
│   │   ├── add_top_product.js      # Product form validation
│   │   ├── login.js                # Login form handling
│   │   ├── signup.js               # Signup form validation
│   │   └── needs_validation.js     # Form validation utilities
│   │
│   ├── images/                     # Static images
│   └── uploads/                    # User-uploaded product images
│
└── README.md                       # Project documentation
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (local or cloud instance)
- **Cloudinary Account** (for image uploads)

### Installation

1. Clone or download the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with the following environment variables:
   ```
   NODE_ENV=development
   MONGO_API=mongodb://127.0.0.1:27017/APB
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Application

Start the development server:
```bash
node app.js
```

The application will run on `http://localhost:8081`

## API Endpoints

### Authentication
- `POST /apb/login` - User login
- `GET /apb/login` - Login page
- `POST /apb/signup` - User registration
- `GET /apb/signup` - Signup page

### Products
- `GET /apb/home` - Home page with featured products
- `GET /apb/top_product` - All products listing
- `GET /apb/new-arrivals` - New products sorted by date
- `GET /apb/most-rated` - Top-rated products
- `GET /apb/fullproduct/:id` - Product detail page
- `POST /product/add` - Add new product (Owner only)
- `GET /apb/fullproduct/:id/edit` - Edit product form (Owner only)
- `POST /apb/fullproduct/:id/edit` - Update product (Owner only)
- `GET /apb/add_product` - Add product page (Owner only)

### Reviews
- `POST /apb/:id/reviews/:ownerID` - Add review to product
- `DELETE /apb/product/:id/reviews/:reviewId` - Delete review

### Shopping Cart
- `GET /apb/cart` - View shopping cart

## Database Models

### User
```javascript
{
  username: String (required),
  first_name: String (required),
  last_name: String,
  email: String (required),
  role: String (default: 'customer'),
  // password: managed by passport-local-mongoose
}
```

### Product
```javascript
{
  name: String,
  Category: String,
  description: String,
  orginal_price: Number,
  Selling_price: Number,
  rating: Number (default: 0),
  review_count: Number (default: 0),
  salesCount: Number (default: 0),
  Availability: Boolean (default: true),
  image: String (Cloudinary URL),
  reviews: [ObjectId] (Reference to Review),
  timestamps: true
}
```

### Review
```javascript
{
  comment: String,
  rating: Number (1-5),
  owner: ObjectId (Reference to User),
  createdAt: Date
}
```

## User Roles

- **Customer**: Can browse products, write reviews, manage shopping cart
- **Owner**: Has all customer permissions plus product management (add, edit, delete products)

## Configuration Files

### `.env`
Environment variables for database connection and Cloudinary credentials. Not included in repository for security.

### `cloudConfig.js`
Cloudinary SDK configuration for image upload and storage.

### `middleware.js`
Contains authentication and authorization checks:
- `isLoggedIn`: Requires user to be authenticated
- `isOwner`: Requires user to have 'owner' role

### `schema.js`
Joi validation schemas for:
- Product data validation
- Review data validation

## Known Limitations

- Order model is partially implemented
- Invoice generation is template-only (functional backend not fully implemented)
- Session-based cart (not persistent across browser closes without additional configuration)
- Single image upload per product

## Development Workflow

1. Make changes to files
2. Restart the server to see changes
3. Access the application via `http://localhost:8081`
4. Review console logs for debugging
5. Check MongoDB for data persistence

## Security Notes

- Session secrets should be changed from default values in production
- Environment variables must be configured properly
- Cloudinary API keys should never be exposed in code
- Authentication middleware protects owner-only routes
- Input validation via Joi prevents invalid data

## Future Enhancements

- Payment gateway integration
- Order management system
- Product inventory management
- Advanced search and filtering
- User profile management
- Product comparison features
- Wishlist functionality
- Email notifications
- Admin dashboard
- Analytics and reporting

## License

ISC

## Support

For issues or questions, refer to the project structure and inline code comments for implementation details.
