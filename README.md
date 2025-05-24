#SaleX - Sales Management Application

A modern, full-stack SaaS web application for managing sales data, teams, and organizations. Built with Next.js, MongoDB, and Clerk authentication.

## Features

- **User Authentication**: Secure authentication and user management with Clerk
- **Organization Management**: Create and manage sales teams with Clerk Organizations
- **Sales Data Management**: Track and manage sales data with CRUD operations
- **Data Encryption**: Sensitive sales data is encrypted in the database
- **Dashboard**: Visualize sales data with charts and analytics
- **Role-based Access Control**: Different permissions for organization admins and members
- **Responsive Design**: Modern UI that works on all devices
- **SaaS Subscription Plans**: Multiple pricing tiers with feature limitations
- **Integrated Payment Processing**: Seamlessly handle payments via Razorpay

## Subscription Plans

SaleX offers three flexible subscription plans to meet the needs of different team sizes:

1. **Starter Plan** - ₹499/month

   - Up to 5 team members
   - 1,000 deals
   - Basic analytics
   - Email support
   - CSV exports

2. **Professional Plan** - ₹999/month

   - Up to 15 team members
   - 10,000 deals
   - Advanced analytics with trends
   - Priority support
   - API access
   - Custom dashboard

3. **Enterprise Plan** - Custom pricing
   - Unlimited team members
   - Unlimited deals
   - Custom reporting
   - Dedicated account manager
   - SSO integration
   - Data retention policy

All plans include a 14-day free trial with full access to Professional plan features.

## Tech Stack

- **Frontend**:

  - Next.js 15 (React framework)
  - TypeScript
  - Tailwind CSS
  - Shadcn UI components
  - Zustand (State management)
  - Recharts (Data visualization)

- **Backend**:

  - Next.js API Routes
  - MongoDB with Mongoose
  - Clerk Authentication
  - Razorpay Payment Gateway

- **Key Libraries**:
  - @clerk/nextjs: User authentication and organization management
  - @tanstack/react-table: Data tables
  - react-hook-form: Form handling
  - zod: Schema validation
  - date-fns: Date manipulation
  - mongoose: MongoDB ODM
  - razorpay: Payment processing

## Project Structure

```
sales-management-app/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   ├── sales-data/   # Sales CRUD operations
│   │   ├── sales-persons/# Team member management
│   │   └── subscriptions/# Subscription management
│   ├── Models/           # Mongoose schemas
│   ├── dashboard/        # Dashboard pages
│   │   └── billing/      # Subscription management UI
│   └── lib/              # Shared utilities
│       ├── razorpay.ts   # Payment gateway integration
│       └── subscription-constants.ts # Plan definitions
├── components/           # UI components
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Clerk account (for authentication)
- Razorpay account (for payment processing)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Webhook
SIGNING_SECRET=your_clerk_webhook_signing_secret

# Data Encryption (use strong unique values)
ENCRYPTION_KEY=your_encryption_key
ENCRYPTION_IV=your_encryption_iv

# Razorpay (for payment processing)
RAZORPAY_TEST_KEY=your_razorpay_key_id
RAZORPAY_TEST_KEY_SECRET=your_razorpay_key_secret
```

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Piyushverma-tech/sales-management-app.git
   cd sales-management-app
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Clerk Webhook Configuration

To ensure proper synchronization of users and organizations, set up webhooks in your Clerk dashboard with the following events:

- **User Events**:

  - `user.created`
  - `user.updated`

- **Organization Events**:
  - `organization.created`
  - `organization.updated`
  - `organization.deleted`
  - `organizationMembership.created`
  - `organizationMembership.updated`
  - `organizationMembership.deleted`

Set the webhook endpoint URL to: `https://your-domain.com/api/webhooks`

## Organization Features

The application includes robust organization management features:

- Create and join organizations
- Invite team members
- Synchronize members between Clerk and the database
- Role-based permissions (admins vs. members)
- Organization-scoped sales data
- Personal and team data views

## Data Models

### Sales

- Customer information
- Deal value
- Status (In Progress, Closed Won, Closed Lost, Negotiation)
- Priority (Low, Medium, High)
- Contact date
- Assigned salesperson
- Organization association

### SalesPerson

- User information synchronized with Clerk
- Organization associations

### Subscription

- Plan information (Starter, Professional, Enterprise, Trial)
- Status tracking (active, trialing, past_due, etc.)
- Usage metrics
- Payment history

## Deployment

This application can be deployed on Vercel for optimal performance:

```bash
npm run build
```

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

## License

[MIT](https://choosealicense.com/licenses/mit/)
