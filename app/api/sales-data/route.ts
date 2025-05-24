import { currentUser, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';
import Subscription from '@/app/Models/SubscriptionSchema';
import { getPlanLimits } from '@/app/lib/subscription-constants';
import { Types } from 'mongoose';

// Define interfaces for query objects
interface SaleQueryFilter {
  _id?: string | Types.ObjectId;
  clerkUserId?: string;
  organizationId?: string | { $exists: boolean };
}

// Get subscription details for an organization
async function getSubscriptionDetails(orgId: string) {
  if (!orgId) return null;

  try {
    const subscription = await Subscription.findOne({ organizationId: orgId });
    if (!subscription) {
      // If no subscription exists, create a trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      return {
        plan: 'trial',
        status: 'trialing',
        features: getPlanLimits('trial'),
      };
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      features: getPlanLimits(subscription.plan),
    };
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
}

// Check if the organization is within deal limits
async function checkDealLimits(orgId: string) {
  try {
    const subscription = await getSubscriptionDetails(orgId);
    if (!subscription) return true; // If can't determine, allow operation

    // Count total deals in the organization
    const dealsCount = await Sale.countDocuments({ organizationId: orgId });

    // Check if within limits
    return dealsCount < subscription.features.maxDeals;
  } catch (error) {
    console.error('Error checking deal limits:', error);
    return true; // If error, allow operation
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the organization from Clerk
    const authContext = await auth();
    const { orgId } = authContext;

    // Check subscription and deal limits if in organization context
    if (orgId) {
      const withinLimits = await checkDealLimits(orgId);
      if (!withinLimits) {
        return NextResponse.json(
          {
            error:
              'Deal limit exceeded for your subscription plan. Please upgrade to create more deals.',
          },
          { status: 403 }
        );
      }

      // Check if organization has active subscription or is in trial
      const subscription = await getSubscriptionDetails(orgId);
      if (
        subscription?.status !== 'active' &&
        subscription?.status !== 'trialing'
      ) {
        return NextResponse.json(
          {
            error:
              'Your subscription is inactive. Please renew to continue using the service.',
          },
          { status: 403 }
        );
      }
    }

    const {
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    } = await req.json();

    // Set up the sale data with proper type definition
    const saleData: {
      clerkUserId: string;
      customerName: string;
      dealValue: string;
      status: string;
      contactDate: string;
      salesperson: string;
      priority: string;
      organizationId?: string; // Make this optional
    } = {
      clerkUserId: user.id,
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    };

    // If organization is selected, add the orgId to the sale
    if (orgId) {
      console.log(
        `Creating sale for organization ${orgId}, user ${user.id}, salesperson ${salesperson}`
      );
      saleData.organizationId = orgId;
    } else {
      console.log(
        `Creating personal sale for user ${user.id}, salesperson ${salesperson}`
      );
    }

    // Create the sale with the appropriate data
    const newSale = await Sale.create(saleData);

    // Verify the saved data has the organization ID
    console.log(
      `Sale created with ID: ${newSale._id}, orgId: ${
        newSale.organizationId || 'none'
      }`
    );

    const newSaleObj = newSale.toObject({ getters: true });
    return NextResponse.json(newSaleObj, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating sale:', error.message, error.stack); // Log full error details
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error); // Log unknown error
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  try {
    await connect();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authData = await auth();
    const orgId = authData.orgId;

    let query: SaleQueryFilter = {};

    // If organization is selected, fetch all sales in that organization
    if (orgId) {
      query = { organizationId: orgId };
    } else {
      // If no organization is selected, fetch only user's personal sales
      query = { clerkUserId: user.id, organizationId: { $exists: false } };
    }

    try {
      // Fetch sales based on the query
      const salesDocs = await Sale.find(query).sort({
        createdAt: -1,
      });

      // Return full objects with getters (for decryption)
      const sales = salesDocs.map((doc) => {
        const sale = doc.toObject({ getters: true });
        console.log(
          `GET: Sale ID ${sale._id}, orgId: ${sale.organizationId || 'none'}`
        );
        return sale;
      });

      return NextResponse.json(sales, { status: 200 });
    } catch (err) {
      console.error('GET: Error fetching sales:', err);
      return NextResponse.json(
        { error: 'Error fetching sales data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('GET: Error in GET /api/sales-data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authData = await auth();
    const orgId = authData.orgId;
    const orgRole = authData.orgRole;

    // console.log('Auth data:', {
    //   orgId,
    //   orgRole,
    //   userId: user.id,
    // });

    const isOrgAdmin = orgRole === 'org:admin' || orgRole === 'admin';

    const {
      _id,
      clerkUserId,
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    } = await req.json();

    // Create appropriate query based on context
    // eslint-disable-next-line prefer-const
    let query: SaleQueryFilter = { _id };

    if (orgId) {
      // Organization context: Apply org filtering and permissions
      query.organizationId = orgId;

      // If not an admin, can only edit own sales
      if (!isOrgAdmin && clerkUserId !== user.id) {
        console.log(
          "Permission denied: User attempted to edit another user's sale"
        );
        return NextResponse.json(
          { error: 'You do not have permission to edit this sale' },
          { status: 403 }
        );
      }

      if (!isOrgAdmin) {
        query.clerkUserId = user.id;
      }
    } else {
      // Personal context: User can only edit their own personal sales
      query.clerkUserId = user.id;
      query.organizationId = { $exists: false };
    }

    const updatedSale = await Sale.findOneAndUpdate(
      query,
      { customerName, dealValue, status, contactDate, salesperson, priority },
      { new: true }
    );

    if (!updatedSale)
      return NextResponse.json(
        { error: 'Sale not found or you do not have permission to edit it' },
        { status: 404 }
      );

    const updatedSaleObj = updatedSale.toObject({ getters: true });
    return NextResponse.json(updatedSaleObj, { status: 200 });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authData = await auth();
    const orgId = authData.orgId;
    const orgRole = authData.orgRole;

    // console.log('DELETE: Auth data:', {
    //   orgId,
    //   orgRole,
    //   userId: user.id,
    // });

    const isOrgAdmin = orgRole === 'org:admin' || orgRole === 'admin';

    const { _id } = await req.json();

    // Create appropriate query based on context
    // eslint-disable-next-line prefer-const
    let query: SaleQueryFilter = { _id };

    if (orgId) {
      // Organization context: Apply org filtering and permissions
      query.organizationId = orgId;

      // If not an admin, can only delete own sales
      if (!isOrgAdmin) {
        query.clerkUserId = user.id;
      }
    } else {
      // Personal context: User can only delete their own personal sales
      query.clerkUserId = user.id;
      query.organizationId = { $exists: false };
    }

    const deletedSale = await Sale.findOneAndDelete(query);

    if (!deletedSale)
      return NextResponse.json(
        { error: 'Sale not found or you do not have permission to delete it' },
        { status: 404 }
      );

    return NextResponse.json(
      { message: 'Sale deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
