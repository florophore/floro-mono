import { getDnsRecords } from "@layered/dns-records";
import { createHash } from "crypto";

export default class EmailHelper {
  public static async isGoogleEmail(email: string): Promise<boolean> {
    const [, domain] = email.split("@");
    if (
      domain == "gmail.com" ||
      domain == "googlemail.com" ||
      domain == "google.com"
    ) {
      return true;
    }

    const mxRecords = await getDnsRecords(domain, ["MX"]);
    return (
      mxRecords?.reduce?.((isGoogle: boolean, record: { value: string }) => {
        if (isGoogle) {
          return true;
        }
        return record?.value?.toLowerCase?.()?.includes("google") ?? false;
      }, false) ?? false
    );
  }

  public static getUniqueEmail(email: string, isGoogleEmail: boolean): string {
    const [address, domain] = email.trim().toLowerCase().split("@");
    if (!isGoogleEmail) {
      return address + "@" + domain;
    }

    const precedingAddress =
      address?.split?.("+")?.[0]?.replace?.(/\./g, "") ?? address;
    return precedingAddress + "@" + domain;
  }

  public static getEmailHash(email: string, isGoogleEmail: boolean): string {
    const normalizedEmail = this.getUniqueEmail(email, isGoogleEmail);
    const hash = createHash("md5");
    hash.update(normalizedEmail);
    return hash.digest("base64");
  }
}
