import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import MembershipRolesLoader from "./MembershipRolesLoader";
import OrganizationPermissionService from "../../../../services/organizations/OrganizationPermissionService";
import { OrganizationMember } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class MembershipPermissionsLoader extends LoaderResolverHook<OrganizationMember, unknown, {currentUser: User| null, cacheKey: string}> {
    protected organizationPermissionService!: OrganizationPermissionService;
    protected requestCache!: RequestCache;
    private membershipRolesLoader!: MembershipRolesLoader;
  
    constructor(
      @inject(OrganizationPermissionService) organizationPermissionService: OrganizationPermissionService,
      @inject(MembershipRolesLoader) membershipRolesLoader: MembershipRolesLoader,
      @inject(RequestCache) requestCache: RequestCache
    ) {
        super();
        this.requestCache = requestCache;
        this.membershipRolesLoader = membershipRolesLoader;
        this.organizationPermissionService = organizationPermissionService;
    }

    public run = runWithHooks(() => [
        this.membershipRolesLoader
    ], async (membership, _, { cacheKey }) => {
        if (membership.membershipState == "inactive") {
            return;
        }
        const cachedPermissions = this.requestCache.getMembershipPermissions(cacheKey, membership.id);
        if (cachedPermissions) {
            return;
        }
        const cachedRoles = this.requestCache.getMembershipRoles(cacheKey, membership.id);
        if (!cachedRoles) {
            return
        }
        const permissions = this.organizationPermissionService.calculatePermissions(cachedRoles)
        this.requestCache.setMembershipPermissions(cacheKey, membership, permissions);
    });
}