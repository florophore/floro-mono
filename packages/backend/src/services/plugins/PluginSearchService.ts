import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { injectable, inject } from "inversify";
import levenshtein from "fast-levenshtein";
import TrieSearch from 'trie-search';
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import { Plugin } from "@floro/database/src/entities/Plugin";

@injectable()
export default class PluginSearchService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async searchPluginsForRepo(
    query: string,
    repository: Repository,
    currentUser: User,
    maxTake = 5
  ): Promise<Array<Plugin>> {
    const pluginsContext = await this.contextFactory.createContext(PluginsContext);
    const privatePlugins = await this.queryPrivatePlugins(repository, currentUser);
    const publicPlugins = await pluginsContext.getPublicReleasedPluginsForRepository(repository);

    const plugins = [...privatePlugins, ...publicPlugins]
    .filter(plugin => (plugin?.versions?.length ?? 0) > 0);

    const trie = new TrieSearch();
    for (const plugin of plugins) {
      const lastReleased = plugin.isPrivate
        ? plugin.lastReleasedPublicPluginVersion
        : plugin.lastReleasedPrivatePluginVersion;
      trie.map(plugin.name.toLowerCase(), plugin.name);
      if (lastReleased) {
        trie.map(lastReleased.displayName.toLowerCase(), plugin.name);
      }
    }

    const editDistanceMap = {};
    for (const plugin of plugins) {
      const lastReleased = plugin.isPrivate
        ? plugin.lastReleasedPublicPluginVersion
        : plugin.lastReleasedPrivatePluginVersion;
      if (lastReleased) {
        editDistanceMap[plugin.name] = Math.min(
          levenshtein.get(plugin.name.toLowerCase(), (query ?? "").toLowerCase()),
          levenshtein.get(
            lastReleased.displayName.toLowerCase(),
            (query ?? "").toLowerCase()
          )
        );
      } else {
        editDistanceMap[plugin.name] = levenshtein.get(
          plugin.name,
          (query ?? "").toLowerCase()
        );
      }
    }
    const trieResult = new Set(trie.search((query ?? "").toLowerCase()));
    return plugins
      .filter(plugin => {
        return trieResult.has(plugin.name) || (editDistanceMap?.[plugin.name] ?? 0) <= 2;
      })
      .sort(
        (a, b) => {
          const aDistance = (editDistanceMap[a.name] ?? Number.MAX_SAFE_INTEGER);
          const bDistance = (editDistanceMap[b.name] ?? Number.MAX_SAFE_INTEGER);
          return aDistance - bDistance;
        }
      )
      .slice(0, maxTake);
  }

  private async queryPrivatePlugins(
    repository: Repository,
    currentUser: User
  ) {
    const pluginsContext = await this.contextFactory.createContext(PluginsContext);
    if (!repository.isPrivate) {
        return [];
    }
    if (repository.repoType == "user_repo") {
        return await pluginsContext.getUserPluginsByType(currentUser.id, true);
    }
    return await pluginsContext.getOrgPluginsByType(repository.organizationId, true);
  }
}