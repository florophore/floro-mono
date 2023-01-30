
import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RepositoryService from "../../services/repositories/RepositoryService";
import PluginRegistryService from "../../services/plugins/PluginRegistryService";

@injectable()
export default class PluginResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = ["Query", "Mutation"];
  protected repositoryService!: RepositoryService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;
  protected pluginRegistryService!: PluginRegistryService;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.loggedInUserGuard = loggedInUserGuard;

    this.pluginRegistryService = pluginRegistryService;
  }

  public Query: main.QueryResolvers = {
    checkPluginNameIsTaken: async (_, { pluginName }) => {
      const exists = await this.pluginRegistryService.checkPluginNameIsTaken(
        pluginName ?? ""
      );
      return {
        exists,
        name: (pluginName ?? "").toLowerCase().trim(),
      };
    },
  };

  public Mutation: main.MutationResolvers = {

  }
}
