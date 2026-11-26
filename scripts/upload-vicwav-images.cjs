require("@next/env").loadEnvConfig(process.cwd());

const path = require("path");
const { Client, Storage, ID, Query } = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

if (!endpoint || !projectId || !apiKey || !bucketId) {
  throw new Error("Missing required Appwrite environment variables.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);

const directory = path.join(process.cwd(), "public/images/vicwav");

const filenames = [
  "embroidery-stack.webp",
  "monochrome-set.webp",
  "tracksuit-black.webp",
  "tees-stack.webp",
  "tracksuit-olive.webp",
  "tracksuit-ivory.webp",
  "hoodie-cutout.webp",
  "hoodie-ivory.webp",
];

async function main() {
  const existing = await storage.listFiles({
    bucketId,
    queries: [Query.limit(100)],
  });

  for (const filename of filenames) {
    const existingFile = existing.files.find(
      (file) => file.name === filename
    );

    if (existingFile) {
      console.log(`Already uploaded: ${filename}`);
      console.log(`File ID: ${existingFile.$id}`);
      continue;
    }

    const filePath = path.join(directory, filename);
    const fileId = ID.custom(filename.replace(".webp", ""));

    const uploaded = await storage.createFile({
      bucketId,
      fileId,
      file: InputFile.fromPath(filePath, filename),
    });

    console.log(`Uploaded: ${filename}`);
    console.log(`File ID: ${uploaded.$id}`);
  }

  console.log("\nUpload check complete.");
}

main().catch((error) => {
  console.error("Upload failed:", error.message || error);
  process.exitCode = 1;
});
