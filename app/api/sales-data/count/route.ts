import { currentUser, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';

export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the organization from Clerk
    const authContext = await auth();
    const { orgId } = authContext;
    
    let query = {};
    
    // If organization is selected, fetch all sales in that organization
    if (orgId) {
      query = { organizationId: orgId };
    } else {
      // If no organization is selected, fetch only user's personal sales
      query = { clerkUserId: user.id, organizationId: { $exists: false } };
    }

    // Count sales based on the query
    const count = await Sale.countDocuments(query);
    
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error counting sales:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 