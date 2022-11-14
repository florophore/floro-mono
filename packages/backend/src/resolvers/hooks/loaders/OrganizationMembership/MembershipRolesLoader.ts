import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { OrganizationMember } from "@floro/graphql-schemas/src/generated/main-graphql";


@injectable()
export default class MembershipRolesLoader extends LoaderResolverHook<OrganizationMember, unknown, {currentUser: User| null, cacheKey: string}> {
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

    public async run(membership, _, { cacheKey }) {
        if (!membership?.id) {
            return;
        }
        const cachedRoles = this.requestCache.getMembershipRoles(cacheKey, membership.id);
        if (cachedRoles) {
            return;
        }
        const organizationMemberRolesContext = await this.contextFactory.createContext(OrganizationMemberRolesContext); 
        const roles = await organizationMemberRolesContext.getRolesByMember(membership);
        this.requestCache.setMembershipRoles(cacheKey, membership, roles);
    }
}