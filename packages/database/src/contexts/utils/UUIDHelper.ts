import { createHash } from "crypto";

export default class UUIDHelper {
public static getUUIDFromString(input: string): string|null {
    const hash = createHash("sha256");
    hash.update(input);
    const sha256bytes = hash.digest();
    const bytes = sha256bytes.subarray(0, 16);
    const str = bytes.toString("hex");
    return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
}

  public static getUUIDFromSha(sha256: string): string | null {
    const buffer = Buffer.from(sha256);
    const bytes = buffer.subarray(0, 16);
    const str = bytes.toString("hex");
    return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(
      12,
      16
    )}-${str.slice(16, 20)}-${str.slice(20)}`;
  }
}
