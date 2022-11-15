import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationInvitationOrganizationLoader from './OrganizationInvitationOrganizationLoader';
import { OrganizationInvitation } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class OrganizationInvitationOrganizationMemberLoader extends LoaderResolverHook<OrganizationInvitation, unknown, {currentUser: User| null, cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;
    private organizationInvitationOrganizationLoader!: OrganizationInvitationOrganizationLoader;
  
    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache,
      @inject(OrganizationInvitationOrganizationLoader) organizationInvitationOrganizationLoader: OrganizationInvitationOrganizationLoader
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
        this.organizationInvitationOrganizationLoader = organizationInvitationOrganizationLoader;
    }

    public run = runWithHooks(() => [
        this.organizationInvitationOrganizationLoader,
    ], async (organiztionInvitation, _, context: {currentUser: User, cacheKey: string}) => {
        if (!context.currentUser) {
            return;
        }
        const organization = this.requestCache.getOrganization(context.cacheKey, organiztionInvitation.organizationId);
        if (!organization) {
            return;
        }
        const cachedMembership = this.requestCache.getOrganizationMembership(context.cacheKey, organiztionInvitation.organizationId, context.currentUser.id)
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