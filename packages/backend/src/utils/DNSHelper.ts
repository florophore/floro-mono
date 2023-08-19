import { WebhookKey } from "@floro/database/src/entities/WebhookKey";
import { getDnsRecords } from "@layered/dns-records";

export default class DNSHelper {
  public static async getTxtRecords(
    domain: string
  ): Promise<
    Array<{ name: string; ttl: string; type: string; value: string }>
  > {
    const txtRecords = await getDnsRecords(domain, ["TXT"]);
    return txtRecords ?? [];
  }

  public static async hasDnsVerificationRecord(webhookKey: WebhookKey) {
    const quotedKey = `"${this.getVerificationKey(webhookKey)}"`;
    const unquotedKey = `${this.getVerificationKey(webhookKey)}`;
    const txtRecords = await this.getTxtRecords(webhookKey.domain ?? "");
    return !!txtRecords.find((v) => v.value == quotedKey || v.value == unquotedKey);
  }

  public static getVerificationKey(webhookKey: {id: string, dnsVerificationCode: string}) {
    return `floro-site-verification=${webhookKey.dnsVerificationCode}`;
  }
}
