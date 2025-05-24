import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import SalesPerson from '@/app/Models/SalesPersonSchema';
import Subscription from '@/app/Models/SubscriptionSchema';
import { getPlanLimits } from '@/app/lib/subscription-constants';

// Get subscription details and check team limits
async function checkTeamLimits(orgId: string) {
  try {
    // Get subscription for the organization
    const subscription = await Subscription.findOne({ organizationId: orgId });

    // If no subscription exists, use trial plan
    const planName = subscription?.plan || 'trial';
    const planLimits = getPlanLimits(planName);

    // Count current team members
    const currentTeamCount = await SalesPerson.countDocuments({
      organizationId: orgId,
    });

    return {
      currentCount: currentTeamCount,
      maxAllowed: planLimits.maxTeamMembers,
      withinLimits: currentTeamCount < planLimits.maxTeamMembers,
      subscription: {
        plan: planName,
        status: subscription?.status || 'trialing',
      },
    };
  } catch (error) {
    console.error('Error checking team limits:', error);
    // If error occurs, allow the operation
    return { withinLimits: true, currentCount: 0, maxAllowed: 5 };
  }
}

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

    // Get limits info to return along with the data
    const limitsInfo = await checkTeamLimits(orgId);

    return NextResponse.json({
      salesPersons: salesPersons.map((sp) => sp.name),
      limits: {
        current: limitsInfo.currentCount,
        maximum: limitsInfo.maxAllowed,
      },
    });
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

    // Check team member limits
    const limitsInfo = await checkTeamLimits(orgId);

    // If subscription is not active or trialing, prevent adding team members
    if (
      limitsInfo.subscription?.status !== 'active' &&
      limitsInfo.subscription?.status !== 'trialing'
    ) {
      return NextResponse.json(
        {
          error:
            'Your subscription is inactive. Please renew to add team members.',
        },
        { status: 403 }
      );
    }

    // If organization is at team member limit, return error
    if (!limitsInfo.withinLimits) {
      return NextResponse.json(
        {
          error: `Team member limit reached (${limitsInfo.currentCount}/${limitsInfo.maxAllowed}). Please upgrade your plan to add more team members.`,
          limits: {
            current: limitsInfo.currentCount,
            maximum: limitsInfo.maxAllowed,
          },
        },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    const existing = await SalesPerson.findOne({
      name,
      organizationId: orgId,
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
      name,
    });

    // Get updated limits
    const updatedLimits = await checkTeamLimits(orgId);

    return NextResponse.json({
      success: true,
      limits: {
        current: updatedLimits.currentCount,
        maximum: updatedLimits.maxAllowed,
      },
    });
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
      organizationId: orgId,
    });

    // Get updated limits
    const updatedLimits = await checkTeamLimits(orgId);

    return NextResponse.json({
      success: true,
      limits: {
        current: updatedLimits.currentCount,
        maximum: updatedLimits.maxAllowed,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
