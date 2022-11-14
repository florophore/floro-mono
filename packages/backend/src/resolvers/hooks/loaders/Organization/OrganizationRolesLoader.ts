import { User } from "@floro/database/src/entities/User";
import { Organization as DBOrganization } from "@floro/database/src/entities/Organization";
import { Organization } from "@floro/graphql-schemas/src/generated/main-graphql";
import { inject, injectable } from "inversify";
import RequestCache from "../../../../request/RequestCache";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import OrganizationMemberPermissionsLoader from "./OrganizationMemberPermissionsLoader";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";

@injectable()
export default class OrganizationRolesLoader extends LoaderResolverHook<
  Organization,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  private organizationMemberPermissionsLoader!: OrganizationMemberPermissionsLoader;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(OrganizationMemberPermissionsLoader)
    organizationMemberPermissionsLoader: OrganizationMemberPermissionsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.organizationMemberPermissionsLoader =
      organizationMemberPermissionsLoader;
  }

  public run = runWithHooks(
    () => [this.organizationMemberPermissionsLoader],
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
      if (membership.membershipState == "inactive") {
        return;
      }
      const permissions = this.requestCache.getMembershipPermissions(
        context.cacheKey,
        membership.id
      );
      if (!permissions.canModifyOrganizationRoles) {
        return;
      }
      const cachedRoles = this.requestCache.getOrganizationRoles(
        context.cacheKey,
        organization.id as string
      );
      if (cachedRoles) {
        return;
      }
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext
      );
      const roles = await organizationRolesContext.getAllForOrg(organization as DBOrganization);
      this.requestCache.setOrganizationRoles(
        context.cacheKey,
        organization as DBOrganization,
        roles
      );
    }
  );
}
