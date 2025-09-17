# Barshop Backend

A Node.js backend server with MongoDB integration for the Barshop application.

## Features

- Express.js server
- MongoDB connection using Mongoose
- RESTful API endpoints
- Environment variable configuration
- CORS enabled
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

   - Copy `.env` file and update the MongoDB connection string
   - For local MongoDB: `mongodb://localhost:27017/barshop`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/barshop`

3. Start MongoDB service (if using local installation)

## Usage

### Development mode (with auto-restart):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

### Initialize Admin User:

```bash
npm run init-admin
```

The server will start on `http://localhost:5000` (or the port specified in the `.env` file).

## Admin User Management

This application enforces a **single admin user** policy:

- Only one user with `role: 'admin'` can exist in the system
- Admin user cannot be deleted
- Attempting to create or update another user to admin role will be rejected
- Use `npm run init-admin` to create the initial admin user
- Check admin status with `GET /api/users/admin/status`

## API Endpoints

### Health Check

- `GET /` - Basic server status
- `GET /api/health` - Server and database health status

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (prevents multiple admins)
- `PUT /api/users/:id` - Update user (prevents multiple admins)
- `DELETE /api/users/:id` - Delete user (prevents admin deletion)

### Admin Management

- `GET /api/users/admin/status` - Check if admin user exists
- `POST /api/users/admin/initialize` - Create initial admin user (only if none exists)

## Project Structure

```
backend/
├── models/          # MongoDB schemas
│   └── User.js
├── routes/          # API route handlers
│   └── users.js
├── .env            # Environment variables
├── .gitignore      # Git ignore rules
├── package.json    # Dependencies and scripts
└── server.js       # Main server file
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment mode (development/production)

## MongoDB Connection

The application connects to MongoDB using Mongoose with the following features:

- Automatic reconnection
- Connection error handling
- Graceful shutdown
- Connection status monitoring

## Next Steps

1. Add authentication middleware
2. Implement password hashing
3. Add input validation
4. Create additional models (Appointments, Services, etc.)
5. Add logging middleware
6. Implement rate limiting
