import { injectable } from "inversify";
import StorageDriver from "./StrorageDriver";
import tar from "tar";
import { Readable } from "stream";
import { env } from "process";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

async function streamToString (stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

@injectable()
export default class AwsStorageDriver implements StorageDriver {
  private bucket!: string;
  public s3Client!: S3Client;

  constructor(storageType: "public" | "private") {
    this.bucket = storageType == "public" ? env.PRIVATE_BUCKET ?? "" : env.PUBLIC_BUCKET ?? "";
    this.s3Client = new S3Client({
      region: env.AWS_S3_REGION ?? "us-east-1",
      credentials:{
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? ""
      }
    });
  }

  public async mkdir(_path: string) {
    // NOTHING TO DO
  }

  public async init() {
    // NOTHING TO DO
  }

  public async exists(path: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path
      });
      const response = await this.s3Client.send(command);
      return response.$metadata.httpStatusCode == 200;
    } catch(e) {
      return false;
    }
  }

  public async read(path: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path
      });
      const response = await this.s3Client.send(command);
      return await streamToString(response.Body as Readable)
    } catch(e) {
      return null;
    }
  }

  public async write(path: string, data: Buffer|string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: typeof data == "string" ? Buffer.from(data) : data
      });
      const response = await this.s3Client.send(command);
      if (response.$metadata.httpStatusCode != 200) {
        throw new Error("failed to upload")
      }
    } catch(e) {
      return;
    }
  }

  public async zipDirectory(path: string): Promise<Readable> {
    return tar.c(
      {
        gzip: true,
        cwd: path,
      },
      ["."]
    );
  }

  public staticRoot() {
    // NO FS, so just leave "/"
    return "/";
  }
}
