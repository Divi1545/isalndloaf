// 📘 README\_onboarding.md (For internal use)

// IslandLoaf Developer & Admin Onboarding Guide

// ✅ Final Launch Checklist Summary
// - Set up PostgreSQL migration with Prisma schema
// - Created DatabaseStorage implementation for Prisma
// - Added flexible storage provider to switch implementations
// - Implemented automated booking test script for QA
// - Created comprehensive README\_onboarding.md documentation
// - Stripe & payment integration completed
// - Vendor onboarding automation added
// - Calendar sync with error handling finalized
// - Admin/Vendor analytics & performance dashboards active

// ❗ Deployment Troubleshooting (LIVE Issues)

// ✅ Preview works but LIVE site buttons don’t:
// Check these:

// 1. Backend API URL
// - Ensure frontend `.env` has VITE\_API\_URL pointing to Replit backend URL
// - Example:
//   VITE\_API\_URL=[https://your-backend.replit.app](https://your-backend.replit.app)

// 2. CORS
// - Backend should allow frontend domain:
//   app.use(cors({ origin: '\*', credentials: true }))

// 3. Auth/session forwarding
// - Ensure tokens are sent in Authorization headers
// - Live frontend must match backend expectations (cookies vs headers)

// 4. Browser DevTools
// - Open Console tab → Look for fetch errors, CORS blocks, and env warnings

// 5. ENV setup mismatch
// - Check .env vars exist in both Replit and Vercel (not just .env file)
// - Must include:
//   - VITE\_API\_URL
//   - JWT\_SECRET
//   - STORAGE\_TYPE
//   - DATABASE\_URL (for Postgres)

// ✅ Action Steps:
// - Add fallback error to buttons if fetch fails
// - Temporarily console.log all API responses for visibility
// - Use `ping` on live backend before loading the app to prevent sleep delay

// 🔧 Want to debug faster?
// Ask Replit console: `console.log('API URL:', process.env.VITE_API_URL)`
// Or deploy backend separately with uptime monitoring

// 1. System Overview
// IslandLoaf is a full-stack tourism platform supporting:
// - Vendor dashboards
// - Admin dashboard
// - Booking management (Stay, Transport, Tours, Wellness, Products)
// - Role-based access
// - Pricing engine with dynamic calculation
// - Calendar sync (Airbnb, Booking.com, etc.)
// - PostgreSQL with Prisma
// - Stripe payments for vendor subscriptions

// 2. Project Structure
// /frontend  - React components for vendor/admin UI
// /backend   - Express API endpoints + storage classes
// /prisma    - Prisma schema + migration scripts
// /scripts   - Automation, QA testing scripts

// 3. Environment Setup
// Copy `.env.example` to `.env` and configure:
// - STORAGE\_TYPE=postgres or memory
// - DATABASE\_URL=your\_postgres\_connection
// - JWT\_SECRET=your\_token\_secret
// - STRIPE\_SECRET\_KEY=your\_stripe\_secret

// 4. Running Locally
// npm install
// npm run dev (frontend)
// npm run server (backend)

// 5. Admin Tasks
// - View platform stats (revenue, campaigns, bookings)
// - Manage vendors and listings
// - Launch and track marketing campaigns
// - View analytics and export vendor performance reports
// - Access automated QA testing tools

// 6. Vendor Access
// - Create & manage listings
// - Sync calendar with major platforms
// - Use AI pricing suggestions
// - Connect to marketplace with payment setup
// - Auto-assigned service categories on signup
// - View weekly insights via AI coach
// - Unlock achievements and badges

// 7. Storage Switching
// - STORAGE\_TYPE=memory → MemStorage
// - STORAGE\_TYPE=postgres → DatabaseStorage with Prisma

// 8. Deployment
// - Backend deployed on Replit (Always On configured)
// - Frontend deployed on Vercel (or Replit preview)
// - QA tests run automatically with test script
// - Stripe connected and operational for monetization
// - Uptime monitored via external pinger

// 🎯 Ready for public launch ✅
