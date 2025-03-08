import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';

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
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch sales from the database
    const salesDocs = await Sale.find({ clerkUserId: user.id }).sort({
      createdAt: -1,
    });

    const sales = salesDocs.map((doc) => doc.toObject({ getters: true }));
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
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
