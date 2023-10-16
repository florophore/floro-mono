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
    if (process.env?.['DOMAIN']) {
      return `https://${process?.env['DOMAIN']}`;
    }
    return "https://floro.io";
  }

  public assetHost(): string {
    if (isDev || isTest) {
      return "http://localhost:9000";
    }
    if (process.env?.['DOMAIN']) {
      return `https://static-cdn.${process?.env['DOMAIN']}`;
    }
    return "https://static-cdn.floro.io";
  }

  public publicRoot(): string {
    if (isDev || isTest) {
      return this.assetHost() + "/cdn";
    }
    if (process.env?.['DOMAIN']) {
      return `https://public-cdn.${process?.env['DOMAIN']}`;
    }
    return "https://public-cdn.floro.io";
  }

  public privateRoot(): string {
    if (isDev || isTest) {
      return this.url() + "/private-cdn";
    }
    if (process.env?.['DOMAIN']) {
      return `https://private-cdn.${process?.env['DOMAIN']}`;
    }
    return "https://private.floro.io";
  }

  public floroApiServer(): string {
    if (isDev || isTest) {
      return "http://localhost:63403";
    }
    if (process.env?.['FLORO_API_HOST']) {
      return process?.env['FLORO_API_HOSTOMAIN'] as string;
    }
    return "https://api.floro.io";
  }

  public cdnPublicPEM(): string {
    if (isDev || isTest) {
      return CDN_PUBLIC_PEM_DEV;
    }
    return env.AWS_SIGNING_PUBLIC_KEY ?? "";
  }

  public cdnPrivatePEM(): string {
    if (isDev || isTest) {
      return CDN_PRIVATE_PEM_DEV;
    }
    return env.AWS_SIGNING_PRIVATE_KEY ?? "";
  }

  public cdnKeypairId(): string {
    return env.AWS_SIGNING_KEYPAIR_ID ?? "";
  }
}
