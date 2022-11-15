import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationInvitationOrganizationMemberRoles from "./OrganizationInvitationOrganizationMemberRoles";
import OrganizationPermissionService from "../../../../services/organizations/OrganizationPermissionService";
import { OrganizationInvitation } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class OrganizationInvitationMemberPermissionsLoader extends LoaderResolverHook<
  OrganizationInvitation,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  private organizationPermissionsService!: OrganizationPermissionService;
  private organizationInvitationOrganizationMemberRoles!: OrganizationInvitationOrganizationMemberRoles;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationPermissionService)
    organizationPermissionsService: OrganizationPermissionService,
    @inject(OrganizationInvitationOrganizationMemberRoles)
    organizationInvitationOrganizationMemberRoles: OrganizationInvitationOrganizationMemberRoles
  ) {
    super();
    this.requestCache = requestCache;
    this.organizationPermissionsService = organizationPermissionsService;
    this.organizationInvitationOrganizationMemberRoles = organizationInvitationOrganizationMemberRoles;
  }

  public run = runWithHooks(
    () => [
        this.organizationInvitationOrganizationMemberRoles
    ],
    async (
      organizationInvitation,
      _,
      context: { currentUser: User; cacheKey: string }
    ) => {
      if (!context.currentUser) {
        return;
      }
      const membership = this.requestCache.getOrganizationMembership(
        context.cacheKey,
        organizationInvitation.organizationId,
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
