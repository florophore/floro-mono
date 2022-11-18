import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import OrganizationMemberLoader from "../hooks/loaders/Organization/OrganizationMemberLoader";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MembershipRolesLoader from "../hooks/loaders/OrganizationMembership/MembershipRolesLoader";
import MembershipPermissionsLoader from "../hooks/loaders/OrganizationMembership/MembershipPermissionsLoader";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberService from "../../services/organizations/OrganizationMemberService";

@injectable()
export default class OrganizationMemberResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "OrganizationMember",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected organizationMemberService!: OrganizationMemberService;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected organizationMemberLoader!: OrganizationMemberLoader;
  protected membershipRolesLoader!: MembershipRolesLoader;
  protected membershipPermissionsLoader!: MembershipPermissionsLoader;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationMemberService)
    organizationMemberService: OrganizationMemberService,
    @inject(MembershipRolesLoader) membershipRolesLoader: MembershipRolesLoader,
    @inject(MembershipPermissionsLoader)
    membershipPermissionsLoader: MembershipPermissionsLoader,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.organizationMemberService = organizationMemberService;

    // loaders
    this.membershipRolesLoader = membershipRolesLoader;
    this.membershipPermissionsLoader = membershipPermissionsLoader;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public OrganizationMember: main.OrganizationMemberResolvers = {
    permissions: runWithHooks(
      () => [this.membershipPermissionsLoader],
      async (organizationMember, _, { cacheKey }) => {
        return this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMember.id
        );
      }
    ),
    roles: runWithHooks(
      () => [this.membershipRolesLoader],
      async (organizationMember, _, { cacheKey }) => {
        return this.requestCache.getMembershipRoles(
          cacheKey,
          organizationMember.id
        );
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    updateOrganizationMembership: runWithHooks(
      () => [],
      async (
        _,
        {
          memberId,
          organizationId,
          internalHandle,
          roleIds
        }: main.MutationUpdateOrganizationMembershipArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "DeactivateOrganizationMemberError",
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
            __typename: "DeactivateOrganizationMemberError",
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
            __typename: "DeactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const organizationMember = await organizationMembersContext.getById(
          memberId
        );
        if (organizationMember?.organizationId != organizationId) {
          return {
            __typename: "DeactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationMemberService.updateOrganizationMember(
          organizationMember,
          organization,
          currentMember,
          permissions,
          internalHandle as string|undefined,
          roleIds as string[]|undefined
        );
        if (result.action == "MEMBER_UPDATED") {
          return {
            __typename: "DeactivateOrganizationMemberSuccess",
            organizationMember: result.organizationMember,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeactivateOrganizationMemberError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeactivateOrganizationMemberError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    deactivateOrganizationMembership: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        {
          memberId,
          organizationId,
        }: main.MutationDeactivateOrganizationMembershipArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "DeactivateOrganizationMemberError",
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
            __typename: "DeactivateOrganizationMemberError",
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
            __typename: "DeactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const organizationMember = await organizationMembersContext.getById(
          memberId
        );
        if (organizationMember?.organizationId != organizationId) {
          return {
            __typename: "DeactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationMemberService.deactivateMember(
          organizationMember,
          organization,
          currentMember,
          permissions
        );
        if (result.action == "MEMBER_DEACTIVATED") {
          return {
            __typename: "DeactivateOrganizationMemberSuccess",
            organizationMember: result.organizationMember,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeactivateOrganizationMemberError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeactivateOrganizationMemberError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    reactivateOrganizationMembership: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        {
          memberId,
          organizationId,
        }: main.MutationReactivateOrganizationMembershipArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "ReactivateOrganizationMemberError",
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
            __typename: "ReactivateOrganizationMemberError",
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
            __typename: "ReactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const organizationMember = await organizationMembersContext.getById(
          memberId
        );
        if (organizationMember?.organizationId != organizationId) {
          return {
            __typename: "ReactivateOrganizationMemberError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizationMemberService.reactivateMember(
          organizationMember,
          organization,
          currentMember,
          permissions
        );
        if (result.action == "MEMBER_REACTIVATED") {
          return {
            __typename: "ReactivateOrganizationMemberSuccess",
            organizationMember: result.organizationMember,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "ReactivateOrganizationMemberError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ReactivateOrganizationMemberError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public Query: main.QueryResolvers = {};
}
