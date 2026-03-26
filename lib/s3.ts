import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  console.warn(
    "AWS_S3_BUCKET is not set. File uploads will fail until this is configured."
  );
}

const s3Client = new S3Client({
  region: REGION,
  followRegionRedirects: true,
});

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadEventFile(options: {
  file: Blob;
  originalName: string;
  eventTitle: string;
  contentType?: string;
}): Promise<{ key: string; url: string }> {
  if (!BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }
  console.log(options.file, "hello");

  const timestamp = Date.now();
  const safeTitle = sanitizeFileName(options.eventTitle || "event");
  const safeName = sanitizeFileName(options.originalName || "file");
  const key = `events/${safeTitle}-${timestamp}-${safeName}`;
  const arrayBuffer = await options.file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: options.contentType || "application/octet-stream",
    })
  );

  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  return { key, url };
}
