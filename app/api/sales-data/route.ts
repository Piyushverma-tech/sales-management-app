import { currentUser, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';

export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the organization from Clerk
    console.log("POST: Getting auth context");
    const authContext = await auth();
    const { orgId } = authContext;
    console.log("POST: Auth context retrieved:", { 
      orgId, 
      hasOrgId: !!orgId,
      userId: user.id
    });
    
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
      console.log(`Creating sale for organization ${orgId}, user ${user.id}, salesperson ${salesperson}`);
      saleData.organizationId = orgId;
    } else {
      console.log(`Creating personal sale for user ${user.id}, salesperson ${salesperson}`);
    }
    
    // For debugging - log the full sale data
    console.log('Sale data to be saved:', JSON.stringify({
      ...saleData,
      customerName: '[ENCRYPTED]',
      dealValue: '[ENCRYPTED]',
      contactDate: '[ENCRYPTED]',
      salesperson: '[ENCRYPTED]',
      organizationId: saleData.organizationId || 'none' // Explicitly log this
    }));
    
    // Create the sale with the appropriate data
    const newSale = await Sale.create(saleData);

    // Verify the saved data has the organization ID
    console.log(`Sale created with ID: ${newSale._id}, orgId: ${newSale.organizationId || 'none'}`);
    
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
    console.log("GET: Connection to database successful");
    
    const user = await currentUser();
    if (!user) {
      console.log("GET: No authenticated user found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`GET: User authenticated: ${user.id}`);

    console.log("GET: Getting auth context");
    const authData = await auth();
    const orgId = authData.orgId;
    console.log("GET: Auth context retrieved:", { 
      orgId, 
      hasOrgId: !!orgId
    });
    
    let query = {};
    
    // If organization is selected, fetch all sales in that organization
    if (orgId) {
      console.log(`GET: Organization selected: ${orgId}`);
      query = { organizationId: orgId };
    } else {
      // If no organization is selected, fetch only user's personal sales
      console.log(`GET: No organization selected, fetching personal sales for user: ${user.id}`);
      query = { clerkUserId: user.id, organizationId: { $exists: false } };
    }

    try {
      // Fetch sales based on the query
      console.log(`GET: Executing query:`, query);
      const salesDocs = await Sale.find(query).sort({
        createdAt: -1,
      });

      console.log(`GET: Found ${salesDocs.length} sales`);
      
      // Return full objects with getters (for decryption)
      const sales = salesDocs.map((doc) => {
        const sale = doc.toObject({ getters: true });
        console.log(`GET: Sale ID ${sale._id}, orgId: ${sale.organizationId || 'none'}`);
        return sale;
      });
      
      return NextResponse.json(sales, { status: 200 });
    } catch (err) {
      console.error("GET: Error fetching sales:", err);
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
    
    // For debugging - log the auth data
    console.log('Auth data:', { 
      orgId, 
      orgRole, 
      userId: user.id 
    });
    
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
    let query: any = { _id };
    
    if (orgId) {
      // Organization context: Apply org filtering and permissions
      query.organizationId = orgId;
      
      // If not an admin, can only edit own sales
      if (!isOrgAdmin && clerkUserId !== user.id) {
        console.log('Permission denied: User attempted to edit another user\'s sale');
        return NextResponse.json(
          { error: 'You do not have permission to edit this sale' },
          { status: 403 }
        );
      }
      
      if (!isOrgAdmin) {
        query.clerkUserId = user.id;
      }
      
      console.log('PUT organization sale query:', query);
    } else {
      // Personal context: User can only edit their own personal sales
      query.clerkUserId = user.id;
      query.organizationId = { $exists: false };
      console.log('PUT personal sale query:', query);
    }
    
    const updatedSale = await Sale.findOneAndUpdate(
      query,
      { customerName, dealValue, status, contactDate, salesperson, priority },
      { new: true }
    );

    if (!updatedSale)
      return NextResponse.json({ error: 'Sale not found or you do not have permission to edit it' }, { status: 404 });
    
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
    
    // For debugging - log the auth data
    console.log('DELETE: Auth data:', { 
      orgId, 
      orgRole, 
      userId: user.id 
    });
    
    const isOrgAdmin = orgRole === 'org:admin' || orgRole === 'admin';
    
    const { _id } = await req.json();
    
    // Create appropriate query based on context
    let query: any = { _id };
    
    if (orgId) {
      // Organization context: Apply org filtering and permissions
      query.organizationId = orgId;
      
      // If not an admin, can only delete own sales
      if (!isOrgAdmin) {
        query.clerkUserId = user.id;
      }
      
      console.log('DELETE organization sale query:', query);
    } else {
      // Personal context: User can only delete their own personal sales
      query.clerkUserId = user.id;
      query.organizationId = { $exists: false };
      console.log('DELETE personal sale query:', query);
    }
    
    const deletedSale = await Sale.findOneAndDelete(query);

    if (!deletedSale)
      return NextResponse.json({ error: 'Sale not found or you do not have permission to delete it' }, { status: 404 });

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
