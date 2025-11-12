
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CopyObjectCommand
} from "@aws-sdk/client-s3";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  if (!bucketName) {
    throw new Error("AWS bucket name not configured");
  }

  const key = `${folderPrefix}${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: getContentType(fileName),
  });

  await s3Client.send(command);
  return key; // Return cloud_storage_path
}

export async function downloadFile(cloud_storage_path: string): Promise<Buffer> {
  if (!bucketName) {
    throw new Error("AWS bucket name not configured");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error("No file content received");
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const stream = response.Body as any;
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

export async function deleteFile(cloud_storage_path: string): Promise<void> {
  if (!bucketName) {
    throw new Error("AWS bucket name not configured");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
  });

  await s3Client.send(command);
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  if (!bucketName) {
    throw new Error("AWS bucket name not configured");
  }

  // First, copy the object to the new key
  const copyCommand = new CopyObjectCommand({
    Bucket: bucketName,
    Key: newKey,
    CopySource: `${bucketName}/${oldKey}`,
  });

  await s3Client.send(copyCommand);
  
  // Then delete the old object
  await deleteFile(oldKey);
  
  return newKey;
}

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}
