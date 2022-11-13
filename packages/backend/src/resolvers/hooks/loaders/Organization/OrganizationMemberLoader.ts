import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/graphql-schemas/src/generated/main-graphql";
import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";

@injectable()
export default class OrganizationMemberLoader extends LoaderResolverHook<Organization, unknown, {currentUser: User| null, cacheKey: string}> {
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

    public async run(organization, _args, context: {currentUser: User, cacheKey: string}): Promise<any|void> {
        if (!context.currentUser) {
            return;
        }
        const cachedMembership = this.requestCache.getOrganizationMembership(context.cacheKey, organization.id, context.currentUser.id)
        if(cachedMembership) {
            return;
        }  
        const organizationMembersContext = await this.contextFactory.createContext(OrganizationMembersContext);
        const organizationMember = await organizationMembersContext.getByOrgAndUser(organization, context.currentUser)
        if (!organizationMember) {
            return;
        }
        this.requestCache.setOrganizationMembership(context.cacheKey, organization, context.currentUser, organizationMember);
    }
}