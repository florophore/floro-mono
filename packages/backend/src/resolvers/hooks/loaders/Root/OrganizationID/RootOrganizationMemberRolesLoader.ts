import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import RootOrganizationMemberLoader from "./RootOrganizationMemberLoader";

@injectable()
export default class RootOrganizationMemberRolesLoader extends LoaderResolverHook<unknown, { organizationId: string}, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private rootOrganizationMemberLoader!: RootOrganizationMemberLoader;

    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(RootOrganizationMemberLoader) rootOrganizationMemberLoader: RootOrganizationMemberLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.rootOrganizationMemberLoader = rootOrganizationMemberLoader;
    }

    public run = runWithHooks(() => [
        this.rootOrganizationMemberLoader
    ], async (_root, { organizationId }, context: {currentUser: User, cacheKey: string})  => {
        if (!context.currentUser) {
            return;
        }
        const membership = this.requestCache.getOrganizationMembership(context.cacheKey, organizationId as string, context.currentUser.id);
        if (!membership) {
            return;
        }
        const cachedRoles = this.requestCache.getMembershipRoles(context.cacheKey, membership.id);
        if (cachedRoles) {
            return;
        }
        const organizationMemberRolesContext = await this.contextFactory.createContext(OrganizationMemberRolesContext);
        const roles = await organizationMemberRolesContext.getRolesByMember(membership);
        this.requestCache.setMembershipRoles(context.cacheKey, membership, roles);
    });
}