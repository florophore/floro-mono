import { injectable, inject } from "inversify";
import StorageDriver from "./drivers/StrorageDriver";
import { env } from "process";
import { sign, verify } from "crypto";
import { parse } from "querystring";
import MainConfig from "@floro/config/src/MainConfig";
import StorageClient from "./StorageClient";

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";
const isDevelopment = NODE_ENV == "development";
const isTest = NODE_ENV == "test";

@injectable()
export default class StorageAuthenticator {
  public config!: MainConfig;

  constructor(@inject(MainConfig) config: MainConfig) {
    this.config = config;
  }

  public signURL(url: string, ttlSec: number) {
    const now = new Date().getTime();
    const expiration = now + ttlSec * 1000;
    const data = Buffer.from(`${url}:expiration=${expiration}`);
    const signature = sign("SHA256", data, this.config.cdnPrivatePEM());
    return `${url}&expiration=${expiration}&signature=${signature.toString(
      "hex"
    )}`;
  }

  /**
   * in prod this is handled by CDN
   */
  public verifySignedURL(signedUrl: string) {
    try {
      const map = parse(signedUrl);
      if (!map?.["expiration"] || !map?.["signature"]) {
        return false;
      }
      const expiration = parseInt(map?.["expiration"] as string);
      const now = new Date().getTime();
      if (now > expiration) {
        return false;
      }
      const data = Buffer.from(
        `${signedUrl?.split("&")[0]}:expiration=${expiration}`
      );
      const signature = Buffer.from(map?.["signature"] as string, "hex");
      return verify("SHA256", data, this.config.cdnPublicPEM(), signature);
    } catch (e) {
      return false;
    }
  }
}
