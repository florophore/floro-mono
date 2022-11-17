import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import OrganizationInvitationService from "../../services/organizations/OrganizationInvitationService";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import OrganizationInvitationMemberPermissionsLoader from "../hooks/loaders/OrganizationInvitation/OrganizationInvitationMemberPermissionLoader";

@injectable()
export default class OrganizationInvitationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "OrganizationInvitation",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected organizationInvitationService!: OrganizationInvitationService;

  // guards
  protected loggedInUserGuard!: LoggedInUserGuard;
  // loaders
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected organizationInvitationMemberPermissionsLoader!: OrganizationInvitationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationInvitationService)
    organizationInvitationService: OrganizationInvitationService,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(OrganizationInvitationMemberPermissionsLoader)
    organizationInvitationMemberPermissionsLoader: OrganizationInvitationMemberPermissionsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;

    this.organizationInvitationService = organizationInvitationService;

    // loaders
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
    this.organizationInvitationMemberPermissionsLoader =
      organizationInvitationMemberPermissionsLoader;
  }

  public OrganizationInvitation: main.OrganizationInvitationResolvers = {
    email: (organizationInvitation) => {
      if (!(organizationInvitation as OrganizationInvitation)?.userExistedAlready) {
        return organizationInvitation.email ?? null;
      }
      return null;
    },
    user: (organizationInvitation, _, { currentUser }) => {
      if (
        (organizationInvitation as OrganizationInvitation)?.userId ==
        currentUser.id
      ) {
        return currentUser;
      }
      return null;
    },
    roles: runWithHooks(
      () => [this.organizationInvitationMemberPermissionsLoader],
      async (organizationInvitation, _, { cacheKey, currentUser }) => {
        if (!currentUser?.id) {
          return null;
        }
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationInvitation.organizationId,
          currentUser.id
        );
        if (!membership) {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canAssignRoles || !permissions.canModifyInvites) {
          return null;
        }
        const cachedInvitationRoles =
          this.requestCache.getOrganizationInvitationRoles(
            cacheKey,
            organizationInvitation?.id as string
          );
        return cachedInvitationRoles;
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    cancelOrganizationInvitation: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async () => {
        console.log()
        return null;
      }
    ),
    resendOrganizationInvitation: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async () => {
        return null;
      }
    ),
    createInvitation: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        args: main.MutationCreateInvitationArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          args.organizationId,
          currentUser.id
        );
        if (!membership) {
          return {
            __typename: "CreateOrganizationInvitationError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions?.canInviteMembers) {
          return {
            __typename: "CreateOrganizationInvitationError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const result =
          await this.organizationInvitationService.createInvitation(
            organization,
            currentUser,
            membership,
            permissions,
            args?.userId as string,
            args?.email as string,
            args?.firstName as string,
            args?.lastName ? args.lastName : "",
            (args?.roleIds ? args.roleIds : []) as string[]
          );

        if (result.action == "INVITATION_CREATED") {
          return {
            __typename: "CreateOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public Query: main.QueryResolvers = {};
}
