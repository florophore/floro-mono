import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import OrganizationRoleService from "../../services/organizations/OrganizationRoleService";

@injectable()
export default class OrganizationRoleResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected organizationRoleService!: OrganizationRoleService;

  // guards
  protected loggedInUserGuard!: LoggedInUserGuard;
  // loaders
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationRoleService)
    organizationRoleService: OrganizationRoleService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;

    this.organizationRoleService = organizationRoleService;

    // guards
    this.loggedInUserGuard = loggedInUserGuard;

    // loaders
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public Mutation: main.MutationResolvers = {
    createOrganizationRole: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        {
          organizationId,
          name,
          isDefault,
          canCreateRepos,
          canModifyOrganizationSettings,
          canModifyOrganizationDeveloperSettings,
          canModifyOrganizationMembers,
          canInviteMembers,
          canModifyInvites,
          canModifyOwnInternalHandle,
          canModifyBilling,
          canModifyOrganizationRoles,
          canAssignRoles,
          canRegisterPlugins,
          canUploadPlugins,
          canReleasePlugins,
        }: main.MutationCreateOrganizationRoleArgs,
        { currentUser, cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "CreateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const currentMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (!currentMember?.id) {
          return {
            __typename: "CreateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          currentMember.id
        );
        if (!permissions) {
          return {
            __typename: "CreateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationRoleService.createRole(
          currentMember,
          permissions,
          currentUser,
          organization,
          name,
          isDefault,
          canCreateRepos,
          canModifyOrganizationSettings,
          canModifyOrganizationDeveloperSettings,
          canModifyOrganizationMembers,
          canInviteMembers,
          canModifyInvites,
          canModifyOwnInternalHandle,
          canModifyBilling,
          canModifyOrganizationRoles,
          canAssignRoles,
          canRegisterPlugins,
          canUploadPlugins,
          canReleasePlugins,
        );
        if (result.action == "ROLE_CREATED") {
          this.requestCache.clearOrganizationRoles(cacheKey, organization);
          this.requestCache.clearMembershipRoles(cacheKey, currentMember);
          return {
            __typename: "CreateOrganizationRoleSuccess",
            organizationRole: result.organizationRole,
            organization,
          };
        }
        return {
          __typename: "CreateOrganizationRoleError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateOrganizationRole: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        {
          organizationId,
          roleId,
          name,
          isDefault,
          canCreateRepos,
          canModifyOrganizationSettings,
          canModifyOrganizationDeveloperSettings,
          canModifyOrganizationMembers,
          canInviteMembers,
          canModifyInvites,
          canModifyOwnInternalHandle,
          canModifyBilling,
          canModifyOrganizationRoles,
          canAssignRoles,
          canRegisterPlugins,
          canUploadPlugins,
          canReleasePlugins,
        }: main.MutationUpdateOrganizationRoleArgs,
        { currentUser, cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "UpdateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const currentMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (!currentMember?.id) {
          return {
            __typename: "UpdateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          currentMember.id
        );
        if (!permissions) {
          return {
            __typename: "UpdateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationRolesContext =
          await this.contextFactory.createContext(OrganizationRolesContext);
        const organizationRole = await organizationRolesContext.getById(roleId);
        if (!organizationRole) {
          return {
            __typename: "UpdateOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationRoleService.updateRole(
          organizationRole,
          currentMember,
          permissions,
          organization,
          name,
          isDefault,
          canCreateRepos,
          canModifyOrganizationSettings,
          canModifyOrganizationDeveloperSettings,
          canModifyOrganizationMembers,
          canInviteMembers,
          canModifyInvites,
          canModifyOwnInternalHandle,
          canModifyBilling,
          canModifyOrganizationRoles,
          canAssignRoles,
          canRegisterPlugins,
          canUploadPlugins,
          canReleasePlugins,
        );
        if (result.action == "ROLE_UPDATED") {
          this.requestCache.clearOrganizationRoles(cacheKey, organization);
          this.requestCache.clearMembershipRoles(cacheKey, currentMember);
          return {
            __typename: "UpdateOrganizationRoleSuccess",
            organizationRole: result.organizationRole,
            organization,
          };
        }
        return {
          __typename: "UpdateOrganizationRoleError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    removeOrganizationRole: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        { organizationId, roleId }: main.MutationRemoveOrganizationRoleArgs,
        { currentUser, cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "RemoveOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const currentMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (!currentMember?.id) {
          return {
            __typename: "RemoveOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          currentMember.id
        );
        if (!permissions) {
          return {
            __typename: "RemoveOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationRolesContext =
          await this.contextFactory.createContext(OrganizationRolesContext);
        const organizationRole = await organizationRolesContext.getById(roleId);
        if (!organizationRole) {
          return {
            __typename: "RemoveOrganizationRoleError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationRoleService.removeRole(
          organizationRole,
          currentMember,
          permissions,
          organization
        );
        if (result.action == "ROLE_REMOVED") {
          this.requestCache.clearOrganizationRoles(cacheKey, organization);
          this.requestCache.clearMembershipRoles(cacheKey, currentMember);
          return {
            __typename: "RemoveOrganizationRoleSuccess",
            organizationRole: result.organizationRole,
            organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "RemoveOrganizationRoleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RemoveOrganizationRoleError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}
