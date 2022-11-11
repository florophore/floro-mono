import { injectable } from "inversify";
import { Organization } from "@floro/database/src/entities/Organization";
import { v4 as uuid } from 'uuid';

@injectable()
export default class RequestCache {
    private cache: {[key: string]: object} = {};

    public init(): string {
        const cacheKey = uuid();
        this.cache[cacheKey] = {};
        return cacheKey;
    }

    public release(cacheKey: string) {
        delete this.cache[cacheKey];
    }

    public setOrganization(cacheKey: string, organization: Organization) {
        if (this.cache[cacheKey]) {
            this.cache[cacheKey]['organization'] = organization; 
        }
    }

    public getOrganization(cacheKey: string): Organization|null {
        return this.cache?.[cacheKey]?.['organization'] ?? null;
    }
}
