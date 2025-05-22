import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    const { orgId } = await auth();
    
    return NextResponse.json({
      user: {
        id: user?.id,
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.primaryEmailAddress?.emailAddress,
      },
      organization: {
        orgId,
        hasOrg: !!orgId,
      }
    });
  } catch (error) {
    console.error("Error in check-org route:", error);
    return NextResponse.json({ error: "Failed to check organization" }, { status: 500 });
  }
} 