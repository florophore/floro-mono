
import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import OrganizationMemberLoader from "../hooks/loaders/Organization/OrganizationMemberLoader";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationPermissionService from "../../services/organizations/OrganizationPermissionService";
import MembershipRolesLoader from "../hooks/loaders/OrganizationMembership/MembershipRolesLoader";
import MembershipPermissionsLoader from "../hooks/loaders/OrganizationMembership/MembershipPermissionsLoader";

@injectable()
export default class OrganizationMemberResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "OrganizationMember",
  ];
  protected organizationPermissionService!: OrganizationPermissionService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected organizationMemberLoader!: OrganizationMemberLoader;
  protected membershipRolesLoader!: MembershipRolesLoader;
  protected membershipPermissionsLoader!: MembershipPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(MembershipRolesLoader) membershipRolesLoader: MembershipRolesLoader,
    @inject(MembershipPermissionsLoader) membershipPermissionsLoader: MembershipPermissionsLoader,
    @inject(OrganizationPermissionService) organizationPermissionService: OrganizationPermissionService
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.organizationPermissionService = organizationPermissionService;

    // loaders
    this.membershipRolesLoader = membershipRolesLoader;
    this.membershipPermissionsLoader = membershipPermissionsLoader; 
  }

  public OrganizationMember: main.OrganizationMemberResolvers = {
    permissions: runWithHooks(() => [
      this.membershipPermissionsLoader
    ], async (organizationMember, _, { cacheKey }) => {
      return this.requestCache.getMembershipPermissions(cacheKey, organizationMember.id);
    }),
    roles: runWithHooks(() => [
      this.membershipRolesLoader
    ], async (organizationMember, _, { cacheKey }) => {
      return this.requestCache.getMembershipRoles(cacheKey, organizationMember.id);
    })
  };

  public Mutation: main.MutationResolvers = {
  };

  public Query: main.QueryResolvers = {
  };
}
