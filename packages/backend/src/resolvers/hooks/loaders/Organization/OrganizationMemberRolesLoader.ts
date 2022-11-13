import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/graphql-schemas/src/generated/main-graphql";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationMemberLoader from "./OrganizationMemberLoader";

@injectable()
export default class OrganizationMemberRolesLoader extends LoaderResolverHook<Organization, unknown, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private organizationMemberLoader!: OrganizationMemberLoader;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(OrganizationMemberLoader) organizationMemberLoader: OrganizationMemberLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.organizationMemberLoader = organizationMemberLoader;
    }

    public run = runWithHooks(() => [
        this.organizationMemberLoader
    ], async (organization: Organization, _args, context: {currentUser: User, cacheKey: string}): Promise<void|any>  => {
        if (!context.currentUser) {
            return;
        }

        const membership = this.requestCache.getOrganizationMembership(context.cacheKey, organization.id as string, context.currentUser.id); 
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