import { injectable, inject } from "inversify";
import StorageDriver from "./drivers/StrorageDriver";
import { env } from "process";
import { sign, verify } from "crypto";
import { parse } from "querystring";
import MainConfig from "@floro/config/src/MainConfig";
import StorageClient from "./StorageClient";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";

@injectable()
export default class StorageAuthenticator {
  public config!: MainConfig;
  public s3Client!: S3Client;

  constructor(@inject(MainConfig) config: MainConfig) {
    this.config = config;
    if (isProduction) {
      this.s3Client = new S3Client({
        region: env.AWS_S3_REGION ?? "us-east-1",
        credentials:{
          accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? ""
        }
      });
    }
  }

  public signURL(url: string, path: string, ttlSec: number) {
    if (isProduction) {
      const dateLessThan = new Date(Date.now() + 1000 * ttlSec);
      const keyPairId = this.config.cdnKeypairId();
      const privateKey = this.config.cdnPrivatePEM();
      console.log("SIGNING EXPIRATION", dateLessThan.toUTCString())
      return getSignedUrl({
        url,
        keyPairId,
        dateLessThan: dateLessThan.toUTCString(),
        privateKey,
      });
    }

    const now = new Date().getTime();
    const expiration = now + ttlSec * 1000;
    const data = Buffer.from(`${path}:expiration=${expiration}`);
    const signature = sign("SHA256", data, this.config.cdnPrivatePEM());
    return `${url}&expiration=${expiration}&signature=${signature.toString(
      "hex"
    )}`;
  }

  /**
   * in prod this is handled by CDN
   */
  public verifySignedURL(fullPath: string, reqPath: string) {
    try {
      const map = parse(fullPath);
      if (!map?.["expiration"] || !map?.["signature"]) {
        return false;
      }
      const expiration = parseInt(map?.["expiration"] as string);
      const now = new Date().getTime();
      if (now > expiration) {
        return false;
      }
      const data = Buffer.from(
        `${reqPath}:expiration=${expiration}`
      );
      const signature = Buffer.from(map?.["signature"] as string, "hex");
      return verify("SHA256", data, this.config.cdnPublicPEM(), signature);
    } catch (e) {
      return false;
    }
  }
}
