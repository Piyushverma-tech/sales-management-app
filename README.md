#SaleX - Sales Management Application

A modern, full-stack web application for managing sales data, teams, and organizations. Built with Next.js, MongoDB, and Clerk authentication.

## Features

- **User Authentication**: Secure authentication and user management with Clerk
- **Organization Management**: Create and manage sales teams with Clerk Organizations
- **Sales Data Management**: Track and manage sales data with CRUD operations
- **Data Encryption**: Sensitive sales data is encrypted in the database
- **Dashboard**: Visualize sales data with charts and analytics
- **Role-based Access Control**: Different permissions for organization admins and members
- **Responsive Design**: Modern UI that works on all devices

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

- **Key Libraries**:
  - @clerk/nextjs: User authentication and organization management
  - @tanstack/react-table: Data tables
  - react-hook-form: Form handling
  - zod: Schema validation
  - date-fns: Date manipulation
  - mongoose: MongoDB ODM

## Project Structure

```
sales-management-app/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── Models/           # Mongoose schemas
│   ├── dashboard/        # Dashboard pages
│   └── lib/              # Shared utilities
├── components/           # UI components
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Clerk account (for authentication)

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

## Deployment

This application can be deployed on Vercel for optimal performance:

```bash
npm run build
```

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

## License

[MIT](https://choosealicense.com/licenses/mit/)
