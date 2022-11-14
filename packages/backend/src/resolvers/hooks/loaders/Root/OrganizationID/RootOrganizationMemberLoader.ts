import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import RequestCache from "../../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import RootOrganizationLoader from './RootOrganizationLoader';

@injectable()
export default class RootOrganizationMemberLoader extends LoaderResolverHook<unknown, { organizationId: string}, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private rootOrganizationLoader!: RootOrganizationLoader;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(RootOrganizationLoader) rootOrganizationLoader: RootOrganizationLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.rootOrganizationLoader = rootOrganizationLoader;
    }

    public run = runWithHooks(() => [
        this.rootOrganizationLoader,
    ], async (_root, { organizationId }, context: {currentUser: User, cacheKey: string}) => {
        if (!context.currentUser) {
            return;
        }
        const organization = this.requestCache.getOrganization(context.cacheKey, organizationId);
        if (!organization) {
            return;
        }
        const cachedMembership = this.requestCache.getOrganizationMembership(context.cacheKey, organizationId, context.currentUser.id)
        if(cachedMembership) {
            return;
        }  
        const organizationMembersContext = await this.contextFactory.createContext(OrganizationMembersContext);
        const organizationMember = await organizationMembersContext.getByOrgAndUser(organization, context.currentUser)
        if (!organizationMember) {
            return;
        }
        this.requestCache.setOrganizationMembership(context.cacheKey, organization, context.currentUser, organizationMember);
    })
}