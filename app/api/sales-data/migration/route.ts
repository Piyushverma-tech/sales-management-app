import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';

// This endpoint will add organizationId to any existing sales
export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization selected' },
        { status: 400 }
      );
    }

    // Find all sales for this user that don't have an organizationId
    const salesWithoutOrgId = await Sale.find({
      clerkUserId: user.id,
      $or: [
        { organizationId: { $exists: false } },
        { organizationId: null },
        { organizationId: "" }
      ]
    });

    // Update them with the current organization ID
    for (const sale of salesWithoutOrgId) {
      sale.organizationId = orgId;
      await sale.save();
    }

    return NextResponse.json({
      success: true,
      migratedCount: salesWithoutOrgId.length,
      message: `Successfully migrated ${salesWithoutOrgId.length} sales to organization ${orgId}`
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
} 