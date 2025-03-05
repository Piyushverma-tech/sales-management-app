import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import SalesPerson from '@/app/Models/SalesPersonSchema';

export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const salesPersons = await SalesPerson.find({ clerkUserId: user.id });
    return NextResponse.json(salesPersons.map((sp) => sp.name));
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
    console.log(error);
  }
}

export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    const existing = await SalesPerson.findOne({ name, clerkUserId: user.id });

    if (existing) {
      return NextResponse.json(
        { error: 'Name already exists' },
        { status: 400 }
      );
    }

    await SalesPerson.create({ clerkUserId: user.id, name });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
    console.log(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    await SalesPerson.findOneAndDelete({ name, clerkUserId: user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
    console.log(error);
  }
}
