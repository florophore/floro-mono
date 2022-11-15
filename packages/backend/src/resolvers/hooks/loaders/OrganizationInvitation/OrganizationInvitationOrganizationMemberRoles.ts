import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationInvitationMemberLoader from "./OrganizationInvitationMemberLoader";
import { OrganizationInvitation } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class OrganizationInvitationOrganizationMemberRolesLoader extends LoaderResolverHook<OrganizationInvitation, unknown, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private organizationInvitationMemberLoader!: OrganizationInvitationMemberLoader;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(OrganizationInvitationMemberLoader) organizationInvitationMemberLoader: OrganizationInvitationMemberLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.organizationInvitationMemberLoader = organizationInvitationMemberLoader;
    }

    public run = runWithHooks(() => [
        this.organizationInvitationMemberLoader
    ], async (organizationInvitation, _, context: {currentUser: User, cacheKey: string})  => {
        if (!context.currentUser) {
            return;
        }
        const membership = this.requestCache.getOrganizationMembership(context.cacheKey, organizationInvitation.organizationId, context.currentUser.id); 
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