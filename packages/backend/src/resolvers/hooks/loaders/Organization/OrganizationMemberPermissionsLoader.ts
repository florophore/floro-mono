import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/graphql-schemas/src/generated/main-graphql";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationMemberRolesLoader from "./OrganizationMemberRolesLoader";
import OrganizationPermissionService from "../../../../services/organizations/OrganizationPermissionService";

@injectable()
export default class OrganizationMemberPermissionsLoader extends LoaderResolverHook<
  Organization,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  private organizationPermissionsService!: OrganizationPermissionService;
  private organizationMemberRolesLoader!: OrganizationMemberRolesLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationPermissionService)
    organizationPermissionsService: OrganizationPermissionService,
    @inject(OrganizationMemberRolesLoader)
    organizationMemberRolesLoader: OrganizationMemberRolesLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.organizationPermissionsService = organizationPermissionsService;
    this.organizationMemberRolesLoader = organizationMemberRolesLoader;
  }

  public run = runWithHooks(
    () => [
        this.organizationMemberRolesLoader
    ],
    async (
      organization: Organization,
      _args,
      context: { currentUser: User; cacheKey: string }
    ) => {
      if (!context.currentUser) {
        return;
      }
      const membership = this.requestCache.getOrganizationMembership(
        context.cacheKey,
        organization.id as string,
        context.currentUser.id
      );
      if (!membership) {
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
