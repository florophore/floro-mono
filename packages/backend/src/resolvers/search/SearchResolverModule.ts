import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import PluginSearchService from "../../services/plugins/PluginSearchService";
import RepoSearchService from "../../services/repositories/RepoSearchService";

@injectable()
export default class SearchResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query"
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected pluginSearchService!: PluginSearchService;
  protected repoSearchService!: RepoSearchService;

  protected loggedInUserGuard!: LoggedInUserGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(PluginSearchService) pluginSearchService: PluginSearchService,
    @inject(RepoSearchService) repoSearchService: RepoSearchService
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.pluginSearchService = pluginSearchService;
    this.repoSearchService = repoSearchService;

    this.loggedInUserGuard = loggedInUserGuard;
  }

  public Query = {

    pageSearch: runWithHooks(() => [this.loggedInUserGuard], async (_, args: main.QueryPageSearchArgs, context): Promise<main.PageSearchResponse|null> => {
        const query = args.query ?? "";
        const usersContext = await this.contextFactory.createContext(UsersContext);
        const organizationContext = await this.contextFactory.createContext(OrganizationsContext);
        if (query?.[0] == "@") {
            // only search users and orgs
            const userResults = await usersContext.searchUsersExcludingIds(query, [context.currentUser.id]);
            const organizationResults = await organizationContext.searchOrganizations(query);
            return {
                __typename: "PageSearchSuccess",
                users: userResults,
                organizations: organizationResults,
                plugins: [],
                repositories: []
            }
        }
        const userResults = await usersContext.searchUsersExcludingIds(query, [context.currentUser.id], 3);
        const organizationResults = await organizationContext.searchOrganizations(query, 3);
        const pluginResults = await this.pluginSearchService.searchPluginsForUser(query, context.currentUser, 3);
        const repoResults = await this.repoSearchService.searchRepoForUser(query, context.currentUser);
        return {
            __typename: "PageSearchSuccess",
            users: userResults,
            organizations: organizationResults,
            plugins: pluginResults,
            repositories: repoResults
        }
    })

  };
}