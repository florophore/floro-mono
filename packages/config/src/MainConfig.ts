import { injectable } from "inversify";
import { env } from "process";
import { CDN_PRIVATE_PEM_DEV, CDN_PUBLIC_PEM_DEV } from "./dev_keys";

const isDev = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";


@injectable()
export default class MainConfig {
  public url(): string {
    if (isDev || isTest) {
      return "http://localhost:9000";
    }
    return "https://floro.io";
  }

  public assetHost(): string {
    if (isDev || isTest) {
      return "http://localhost:9000";
    }
    return "https://cdn.floro.io";
  }

  public publicRoot(): string {
    if (isDev || isTest) {
      return this.assetHost() + "/cdn";
    }
    return "https://public.floro.io";
  }

  public privateRoot(): string {
    if (isDev || isTest) {
      return this.url() + "/private-cdn";
    }
    return "https://private.floro.io";
  }

  public cdnPublicPEM(): string {
    if (isDev || isTest) {
      return CDN_PUBLIC_PEM_DEV;
    }
    return process.env.CDN_PUBLIC_PEM ?? "";
  }

  public cdnPrivatePEM(): string {
    if (isDev || isTest) {
      return CDN_PRIVATE_PEM_DEV;
    }
    return process.env.CDN_PRIVATE_PEM ?? "";
  }
}
