import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import SalesPerson from '@/app/Models/SalesPersonSchema';

export async function POST() {
  try {
    console.log("Starting sync-members endpoint");
    
    // Connect to database
    try {
      await connect();
      console.log("MongoDB connected");
    } catch (dbError) {
      console.error("MongoDB connection error:", dbError);
      return NextResponse.json({ 
        error: 'Database connection error'
      }, { status: 500 });
    }
    
    // Get current user
    const user = await currentUser();
    if (!user) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("Current user found:", user.id);

    // Get organization ID
    const authData = await auth();
    const orgId = authData.orgId;
    if (!orgId) {
      console.log("No organization selected");
      return NextResponse.json(
        { error: 'No organization selected' },
        { status: 400 }
      );
    }
    console.log("Organization ID:", orgId);

    // Add the current user as a sales person (for testing)
    try {
      // Check if user already exists as sales person
      const existingUser = await SalesPerson.findOne({
        clerkUserId: user.id,
        organizationId: orgId
      });

      // Add user if they don't exist
      if (!existingUser) {
        // Get user's name or email
        const userName = user.firstName 
          ? `${user.firstName} ${user.lastName || ''}`.trim() 
          : user.emailAddresses[0].emailAddress;

        // Create sales person
        await SalesPerson.create({
          clerkUserId: user.id,
          organizationId: orgId,
          name: userName
        });
        console.log("Sales person created:", userName);
      } else {
        console.log("User already exists as sales person");
      }

      // Get all sales persons
      const salesPersons = await SalesPerson.find({ organizationId: orgId });
      const salesPersonNames = salesPersons.map(sp => sp.name);
      console.log("Sales persons:", salesPersonNames);
      
      // Return success
      return NextResponse.json({
        success: true,
        count: salesPersonNames.length,
        salesPersons: salesPersonNames
      });
    } catch (error) {
      console.error("Error creating sales person:", error);
      return NextResponse.json({ error: 'Failed to create sales person' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 