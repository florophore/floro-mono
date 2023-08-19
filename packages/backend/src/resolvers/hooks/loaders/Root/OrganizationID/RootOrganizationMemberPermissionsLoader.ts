import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../../request/RequestCache";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import RootOrganizationMemberRolesLoader from "./RootOrganizationMemberRolesLoader";
import OrganizationPermissionService from "../../../../../services/organizations/OrganizationPermissionService";

@injectable()
export default class RootOrganizationMemberPermissionsLoader extends LoaderResolverHook<
  unknown,
  { organizationId: string},
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  private organizationPermissionsService!: OrganizationPermissionService;
  private rootOrganizationMemberRolesLoader!: RootOrganizationMemberRolesLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationPermissionService)
    organizationPermissionsService: OrganizationPermissionService,
    @inject(RootOrganizationMemberRolesLoader)
    rootOrganizationMemberRolesLoader: RootOrganizationMemberRolesLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.organizationPermissionsService = organizationPermissionsService;
    this.rootOrganizationMemberRolesLoader = rootOrganizationMemberRolesLoader;
  }

  public run = runWithHooks(
    () => [
        this.rootOrganizationMemberRolesLoader
    ],
    async (
      _root,
      { organizationId },
      context: { currentUser: User; cacheKey: string }
    ) => {
      if (!context.currentUser) {
        return;
      }
      const membership = this.requestCache.getOrganizationMembership(
        context.cacheKey,
        organizationId,
        context.currentUser.id
      );
      // allows only self to be viewed
      if (!membership || membership.userId != context.currentUser.id) {
        return;
      }
      const cachedPermissions = this.requestCache.getMembershipPermissions(
        context.cacheKey,
        membership.id
      );
      if (cachedPermissions) {
        return;
      }
      const cachedRoles = this.requestCache.getMembershipRoles(
        context.cacheKey,
        membership.id
      );
      const permissions =
        this.organizationPermissionsService.calculatePermissions(
          cachedRoles ?? []
        );

      this.requestCache.setMembershipPermissions(
        context.cacheKey,
        membership,
        permissions
      );
    }
  );
}
