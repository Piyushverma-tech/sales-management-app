import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';

// POST: Create a new sale
export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    } = await req.json();

    const newSale = await Sale.create({
      clerkUserId: user.id,
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    });

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET: Fetch all sales for the logged-in user
export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sales = await Sale.find({ clerkUserId: user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT: Update a specific sale
export async function PUT(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      _id,
      customerName,
      dealValue,
      status,
      contactDate,
      salesperson,
      priority,
    } = await req.json();

    const updatedSale = await Sale.findOneAndUpdate(
      { _id, clerkUserId: user.id }, // Ensure user can only update their own sales
      { customerName, dealValue, status, contactDate, salesperson, priority },
      { new: true }
    );

    if (!updatedSale)
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });

    return NextResponse.json(updatedSale, { status: 200 });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

//DELETE: Delete a specific sale
export async function DELETE(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { _id } = await req.json();

    const deletedSale = await Sale.findOneAndDelete({
      _id,
      clerkUserId: user.id, // Ensure the logged-in user owns the sale
    });

    if (!deletedSale)
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });

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
