# Surplus Spark Network - Backend API

Backend API for the Surplus Spark Network food donation platform. Supports authentication and user management for four user roles: Donors, NGOs, Logistics Partners, and Admins.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/surplus-spark-network
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
```

### 3. Install and Start MongoDB

Make sure MongoDB is installed and running on your system.

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud):**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env` with your connection string

### 4. Run the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
```

**Request Body (Donor):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "location": "New York, NY",
  "donorType": "restaurant"
}
```

**Request Body (NGO):**
```json
{
  "name": "Food Aid NGO",
  "email": "contact@foodaid.org",
  "password": "password123",
  "role": "ngo",
  "location": "Los Angeles, CA",
  "ngoRegistrationId": "NGO123456"
}
```

**Request Body (Logistics):**
```json
{
  "name": "Fast Delivery",
  "email": "driver@delivery.com",
  "password": "password123",
  "role": "logistics",
  "location": "Chicago, IL",
  "vehicleType": "van"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "location": "New York, NY",
      "donorType": "restaurant"
    }
  }
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor"
    }
  }
}
```

#### Get Profile (Protected)
```
GET /api/auth/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "donor",
      "location": "New York, NY",
      "isVerified": false
    }
  }
}
```

#### Health Check
```
GET /api/health
```

## User Roles

1. **Donor** - Individuals, restaurants, grocery stores, hotels
2. **NGO** - Non-profit organizations and recipients
3. **Logistics** - Delivery partners with vehicles
4. **Admin** - Platform administrators

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── controllers/
│   │   └── authController.ts # Authentication logic
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── models/
│   │   └── User.ts           # User model with all roles
│   ├── routes/
│   │   └── authRoutes.ts     # Authentication routes
│   ├── utils/
│   │   └── jwt.ts            # JWT utilities
│   └── server.ts             # Main server file
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Development Tips

- Use tools like **Postman** or **Thunder Client** to test API endpoints
- Check MongoDB with **MongoDB Compass** for database visualization
- Logs are printed to console for debugging
- All passwords are automatically hashed before saving to database
- JWT tokens expire after 7 days

## Next Steps

- Add email verification
- Implement password reset functionality
- Add refresh token mechanism
- Set up role-based access control for resources
- Add profile update endpoints
- Implement file uploads for profile pictures
