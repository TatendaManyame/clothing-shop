import { Account, Client } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error("Missing Appwrite environment variables");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);

export { client, account };