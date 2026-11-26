import "server-only";

import { NextRequest } from "next/server";
import { Account, Client } from "node-appwrite";

export async function getAdminUserId(
  request: NextRequest
): Promise<string | null> {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return null;
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    const allowedAdmins = (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!endpoint || !projectId || allowedAdmins.length === 0) {
      return null;
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setJWT(token);

    const user = await new Account(client).get();

    if (!allowedAdmins.includes(user.$id)) {
      return null;
    }

    return user.$id;
  } catch {
    return null;
  }
}