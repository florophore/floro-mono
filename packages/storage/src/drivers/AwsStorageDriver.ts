import { injectable } from "inversify";
import StorageDriver from "./StrorageDriver";
import tar from "tar";
import { PassThrough, Readable } from "stream";
import { env } from "process";
import path from 'path';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
import StorageAuthenticator from "../StorageAuthenticator";
import MainConfig from "@floro/config/src/MainConfig";
import fetch from 'node-fetch';
import mime from 'mime-types';
import stream from 'stream';

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
  public storageType!: "public"|"private";
  private storageAuthenticator?: StorageAuthenticator;
  private mainConfig?: MainConfig;

  constructor(storageType: "public" | "private") {
    this.storageType = storageType;
    this.bucket = storageType == "private" ? env.PRIVATE_BUCKET ?? "" : env.PUBLIC_BUCKET ?? "";
    this.s3Client = new S3Client({
      region: env.AWS_S3_REGION ?? "us-east-1",
      credentials:{
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? ""
      }
    });
  }

  public setAuthenticator(storageAuthenticator: StorageAuthenticator) {
    this.storageAuthenticator = storageAuthenticator;
  }

  public setMainConfig(mainConfig: MainConfig) {
    this.mainConfig = mainConfig;
  }

  public async mkdir(_fpath: string) {
    // NOTHING TO DO
  }

  public async init() {
    // NOTHING TO DO
  }

  public async exists(fpath: string) {
    try {
      const key = fpath[0] == "/" ? fpath.substring(1) : fpath;
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      const response = await this.s3Client.send(command);
      return response.$metadata.httpStatusCode == 200;
    } catch(e) {
      return false;
    }
  }

  public writeStream(fpath: string): [PassThrough, Upload] {
    const passThroughStream = new stream.PassThrough();
    const key = fpath[0] == "/" ? fpath.substring(1) : fpath;
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: passThroughStream,
        ContentType: 'application/gzip'
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });
    return [passThroughStream, upload];
  };

  public async read(fpath: string) {
    try {
      const key = fpath[0] == "/" ? fpath.substring(1) : fpath;
      if (this.storageType == "private" && this.mainConfig && this.storageAuthenticator) {
        const urlPath = "/" + key
        const url = this.mainConfig.privateRoot() + urlPath;
        const signedUrl = this.storageAuthenticator.signURL(url, urlPath, 3600);
        const response = await fetch(signedUrl);
        return await response.text();
      }
      if (this.storageType == "public" && this.mainConfig) {
        const urlPath = "/" + key
        const url = this.mainConfig.publicRoot() + urlPath;
        const response = await fetch(url);
        return await response.text();
      }
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      const response = await this.s3Client.send(command);
      return await streamToString(response.Body as Readable)
    } catch(e) {
      return null;
    }
  }

  public async write(fpath: string, data: Buffer|string) {
    try {
      const key = fpath[0] == "/" ? fpath.substring(1) : fpath;
      const mimeType = mime.contentType(path.extname(fpath)) as string;
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: typeof data == "string" ? Buffer.from(data) : data,
        ContentType: mimeType
      });
      const response = await this.s3Client.send(command);
      if (response.$metadata.httpStatusCode != 200) {
        throw new Error("failed to upload")
      }
    } catch(e) {
      return;
    }
  }

  public async zipDirectory(fpath: string): Promise<Readable> {
    return tar.c(
      {
        gzip: true,
        cwd: fpath,
      },
      ["."]
    );
  }

  public staticRoot() {
    // NO FS, so just leave ""
    return "";
  }
}
