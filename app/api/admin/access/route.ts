import { NextRequest, NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminUserId(request);

    return NextResponse.json({
      isAdmin: Boolean(adminId),
    });
  } catch {
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}
