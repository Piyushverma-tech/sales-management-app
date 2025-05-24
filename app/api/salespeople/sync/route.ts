import { NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import SalesPerson from '@/app/Models/SalesPersonSchema';

// Define interface for SalesPerson document
interface ISalesPerson {
  _id: string;
  clerkUserId: string;
  organizationId: string;
  name: string;
}

export const dynamic = 'force-dynamic';

// GET endpoint to sync salespeople from Clerk to the database
export async function GET() {
  try {
    await connect();
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is in an organization context
    const { orgId, orgRole } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization selected' },
        { status: 400 }
      );
    }
    
    // Only allow admins to sync
    const isAdmin = orgRole === 'org:admin' || orgRole === 'admin';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only organization admins can synchronize members' },
        { status: 403 }
      );
    }
    
    // Get the Clerk client instance
    const clerk = await clerkClient();
    
    // Fetch organization members from Clerk
    const organizationMembers = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId
    });
    
    // Get existing salespeople in the database
    const existingSalespeople = await SalesPerson.find({ organizationId: orgId });
    
    // Map of existing salespeople by clerkUserId for quick lookup
    const existingSalespeopleMap = existingSalespeople.reduce((acc, sp) => {
      acc[sp.clerkUserId] = sp;
      return acc;
    }, {} as Record<string, ISalesPerson>);
    
    // Track IDs for added/updated/removed salespeople
    const results = {
      added: [] as string[],
      updated: [] as string[],
      removed: [] as string[],
    };
    
    // Process all members from Clerk - add or update
    const processPromises = organizationMembers.data.map(async (member) => {
      const userId = member.publicUserData?.userId;
      if (!userId) return;
      
      const name = member.publicUserData.firstName
        ? `${member.publicUserData?.firstName} ${member.publicUserData?.lastName || ''}`
        : member.publicUserData.identifier;
      
      // If member exists, update their info
      if (existingSalespeopleMap[userId]) {
        const existingSalesPerson = existingSalespeopleMap[userId];
        if (existingSalesPerson.name !== name) {
          await SalesPerson.findByIdAndUpdate(existingSalesPerson._id, { name });
          results.updated.push(userId);
        }
        // Mark as processed
        delete existingSalespeopleMap[userId];
      } 
      // If member doesn't exist, create them
      else {
        await SalesPerson.create({
          clerkUserId: userId,
          organizationId: orgId,
          name
        });
        results.added.push(userId);
      }
    });
    
    // Wait for all members to be processed
    await Promise.all(processPromises);
    
    // Any remaining salespeople in the map are no longer in the organization - remove them
    const removePromises = Object.keys(existingSalespeopleMap).map(async (userId) => {
      await SalesPerson.findOneAndDelete({ 
        clerkUserId: userId,
        organizationId: orgId
      });
      results.removed.push(userId);
    });
    
    // Wait for all deletions to complete
    await Promise.all(removePromises);
    
    return NextResponse.json({
      success: true,
      syncResults: {
        added: results.added.length,
        updated: results.updated.length,
        removed: results.removed.length,
      }
    });
    
  } catch (error) {
    console.error('Error synchronizing salespeople:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize salespeople' },
      { status: 500 }
    );
  }
} 