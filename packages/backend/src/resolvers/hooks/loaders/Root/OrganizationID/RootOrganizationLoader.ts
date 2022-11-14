import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../../ResolverHook";
import RequestCache from "../../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Organization } from "@floro/database/src/entities/Organization";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";


@injectable()
export default class OrganizationLoader extends LoaderResolverHook<unknown, { organizationId: string}, {cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
    }

    public async run(_root, { organizationId}, { cacheKey }) {
        const cachedRoles = this.requestCache.getOrganization(cacheKey, organizationId);
        if (cachedRoles) {
            return;
        }
        const organizationsContext = await this.contextFactory.createContext(OrganizationsContext); 
        const organization = await organizationsContext.getById(organizationId);
        this.requestCache.setOrganization(cacheKey, organization as Organization);
    }
}