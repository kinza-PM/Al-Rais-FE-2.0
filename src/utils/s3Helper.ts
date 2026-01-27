import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure your S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  // credentials: {
  //   accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
  //   secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  // },
});

export interface S3UploadOptions {
  bucket: string;
  key: string;
  file: Blob;
  contentType?: string;
}

/**
 * Convert Blob to Buffer/Uint8Array for AWS SDK
 */
const blobToBuffer = async (blob: Blob): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("Failed to convert blob to buffer"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading blob"));
    };

    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Upload a file to S3
 * @param options - Upload configuration
 * @returns S3 file URL
 */
export const uploadToS3 = async (options: S3UploadOptions): Promise<string> => {
  const { bucket, key, file, contentType = "application/pdf" } = options;

  try {
    // Convert Blob to Uint8Array using FileReader for better browser compatibility
    const buffer = await blobToBuffer(file);
    console.log(buffer);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read", // Remove this if you want private files
    });
    console.log('s3Client-----------', s3Client);
    
    await s3Client.send(command);
    console.log(command);

    // Return the public URL
    const fileUrl = `https://${bucket}.s3.${
      import.meta.env.VITE_AWS_REGION || "us-east-1"
    }.amazonaws.com/${key}`;
    console.log("fileUrl-----------", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload PDF to S3");
  }
};
