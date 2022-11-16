import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/database/src/entities/Organization";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationMemberPermissionsLoader from "./OrganizationMemberPermissionsLoader";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";

@injectable()
export default class OrganizationSentInvitationsCountLoader extends LoaderResolverHook<Organization, unknown, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private organizationMemberPermissionsLoader!: OrganizationMemberPermissionsLoader;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(OrganizationMemberPermissionsLoader) organizationMemberPermissionsLoader: OrganizationMemberPermissionsLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.organizationMemberPermissionsLoader = organizationMemberPermissionsLoader;
    }

    public run = runWithHooks(() => [
        this.organizationMemberPermissionsLoader
    ], async (organization: Organization, _args, context: {currentUser: User, cacheKey: string}) => {
        if (!context.currentUser) {
            return;
        }

        const membership = this.requestCache.getOrganizationMembership(context.cacheKey, organization.id as string, context.currentUser.id); 
        if (!membership) {
            return;
        }
        if (membership.membershipState == "inactive") {
            return;
        }
        const permissions = this.requestCache.getMembershipPermissions(context.cacheKey, membership.id);
        // allow members who can invite (so they can derive remaining seats) and members who can modify members
        if (!permissions?.canModifyInvites && !permissions?.canInviteMembers && !permissions.canModifyOrganizationMembers) {
            return;
        }
        const cachedCount = this.requestCache.getOrganizationSentInvitationsCount(context.cacheKey, organization.id);
        if (cachedCount === null) {
            return;
        }
        const organizationInvitationsContext = await this.contextFactory.createContext(OrganizationInvitationsContext); 
        const count = await organizationInvitationsContext.getSentInvitationCountForOrganization(organization.id as string);
        this.requestCache.setOrganizationSentInvitationsCount(context.cacheKey, organization as Organization, count);
    });
}