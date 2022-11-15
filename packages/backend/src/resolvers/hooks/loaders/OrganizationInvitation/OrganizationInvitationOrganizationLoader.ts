
import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Organization } from "@floro/database/src/entities/Organization";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import { OrganizationInvitation } from "@floro/graphql-schemas/src/generated/main-graphql";


@injectable()
export default class OrganizationInvitationOrganizationLoader extends LoaderResolverHook<OrganizationInvitation, unknown, {cacheKey: string}> {
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

    public async run(organizationInvitation, _, { cacheKey }) {
        const cachedOrganization = this.requestCache.getOrganization(cacheKey, organizationInvitation.organizationId);
        if (cachedOrganization) {
            return;
        }
        const organizationsContext = await this.contextFactory.createContext(OrganizationsContext); 
        const organization = await organizationsContext.getById(organizationInvitation.organizationId);
        this.requestCache.setOrganization(cacheKey, organization as Organization);
    }
}