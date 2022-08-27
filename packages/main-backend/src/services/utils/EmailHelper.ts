import { injectable } from "inversify";
import { getDnsRecords } from '@layered/dns-records';

@injectable()
export default class EmailHelper {

    public async isGoogleEmail(email: string): Promise<boolean> {
        const [_, domain] = email.split('@');
        if (domain == 'gmail.com' || domain == 'googlemail.com' || domain == 'google.com') {
            return true;
        }

        const records =  await getDnsRecords(domain, ['MX']);
        return records.reduce((isGoogle, record) => {
            if (isGoogle) {
              return false;
            }
            return record?.value?.toLowerCase?.()?.includes("google") ?? false;
        }, false);
    }


    public async getUniqueEmail(email: string, isGoogleEmail: boolean): Promise<string> {
        const [address, domain] = email.toLowerCase?.()?.split('@');
        if (!isGoogleEmail) {
            return address + '@' + domain;
        }

        const precedingAddress = address?.split?.('+')?.[0]?.replace?.(/\./g, '') ?? address;
        return precedingAddress + '@' + domain;
    }

}