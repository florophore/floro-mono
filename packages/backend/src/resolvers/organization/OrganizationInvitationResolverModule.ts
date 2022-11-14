import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import OrganizationInvitationService from "../../services/organizations/OrganizationInvitationService";

@injectable()
export default class OrganizationInvitationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "OrganizationInvitation",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected organizationInvitationService!: OrganizationInvitationService;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationInvitationService) organizationInvitationService: OrganizationInvitationService,
    @inject(RootOrganizationMemberPermissionsLoader) rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;

    this.organizationInvitationService = organizationInvitationService;

    // loaders
    this.rootOrganizationMemberPermissionsLoader = rootOrganizationMemberPermissionsLoader;
  }

  public OrganizationInvitation: main.OrganizationMemberResolvers = {

  };

  public Mutation: main.MutationResolvers = {
    createInvitation: runWithHooks(() => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader
    ], async (_root, args: main.MutationCreateInvitationArgs, { cacheKey, currentUser}) => {
        const organization = this.requestCache.getOrganization(cacheKey, args.organizationId);
        const membership = this.requestCache.getOrganizationMembership(cacheKey, args.organizationId, currentUser.id);
        if (!membership) {
          return {
            __typename: "CreateOrganizationInvitationError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(cacheKey, membership.id);
        if (!permissions.canInviteMembers) {
          return {
            __typename: "CreateOrganizationInvitationError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const result = await this.organizationInvitationService.createInivitation(
          organization,
          currentUser,
          membership,
          permissions,
          args?.userId as string,
          args?.email as string,
          args?.firstName as string,
          args?.lastName as string,
          (args?.roleIds ?? []) as string[]
        );

        if (result.action == 'INVITATION_CREATED') {
          return {
            __typename: "CreateOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation
          };
        }
        if (result.action == 'LOG_ERROR') {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
        }
        return {
          __typename: "CreateOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
    })
  };

  public Query: main.QueryResolvers = {
  };
}
