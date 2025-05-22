# IslandLoaf Application

This is a packaged version of the IslandLoaf tourism platform. Follow the instructions below to get it running on your system.

## Installation

1. Unzip the contents to a folder on your machine
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your environment variables:
   - Copy `.env.example` to `.env`
   - Set your database connection and other required variables

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. The application will be available at `http://localhost:5000`

## Login Credentials

- **Vendor Account**: 
  - Email: vendor@islandloaf.com
  - Password: password123

- **Admin Account**:
  - Email: admin@islandloaf.com
  - Password: admin123

## Important Files

- `client/src/` - React frontend components
- `server/` - Express API backend
- `shared/schema.ts` - Data models and validation schemas
- `prisma/schema.prisma` - Database schema

## PostgreSQL Setup

To use PostgreSQL instead of in-memory storage:

1. Set `STORAGE_TYPE=postgres` in your `.env` file
2. Make sure your `DATABASE_URL` is properly configured
3. Run database migrations: `npx prisma migrate dev`

For more detailed information, refer to `README_onboarding.md`.