import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import SalesPerson from '@/app/Models/SalesPersonSchema';

export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await auth();
    
    if (!orgId) {
      // Return just the user's own sales records if no organization is selected
      const salesPersons = await SalesPerson.find({ clerkUserId: user.id });
      return NextResponse.json(salesPersons.map((sp) => sp.name));
    }

    // Return all sales persons in the organization
    const salesPersons = await SalesPerson.find({ organizationId: orgId });
    return NextResponse.json(salesPersons.map((sp) => sp.name));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization selected' },
        { status: 400 }
      );
    }

    const { name } = await req.json();
    const existing = await SalesPerson.findOne({ 
      name, 
      organizationId: orgId 
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Name already exists in this organization' },
        { status: 400 }
      );
    }

    await SalesPerson.create({ 
      clerkUserId: user.id, 
      organizationId: orgId,
      name 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization selected' },
        { status: 400 }
      );
    }

    const { name } = await req.json();
    await SalesPerson.findOneAndDelete({ 
      name, 
      organizationId: orgId 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
