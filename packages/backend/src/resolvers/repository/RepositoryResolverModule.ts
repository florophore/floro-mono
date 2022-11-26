import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import RepositoryService from "../../services/repositories/RepositoryService";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class RepositoryResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
  ];
  protected repositoryService!: RepositoryService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.repositoryService = repositoryService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public Mutation: main.MutationResolvers = {
    createUserRepository: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { name, isPrivate, licenseCode }: main.MutationCreateUserRepositoryArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateUserRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result =
          await this.repositoryService.createUserRepository(
            currentUser,
            name,
            isPrivate,
            licenseCode
          );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateUserRepositorySuccess",
            repository: (result.repository as unknown) as Repository,
            user: currentUser
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateUserRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateUserRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    createOrgRepository: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        {
          organizationId,
          name,
          isPrivate,
          licenseCode,
        }: main.MutationCreateOrgRepositoryArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organization = this.requestCache.getOrganization(cacheKey, organizationId);
        if (!organization) {
          return {
          __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser
        );
        if (!membership) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canCreateRepos) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result =
          await this.repositoryService.createOrganizationRepository(
            organization,
            currentUser,
            name,
            isPrivate,
            licenseCode
          );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateOrganizationRepositorySuccess",
            repository: (result.repository as unknown) as Repository,
            organization: organization
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateOrganizationRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}