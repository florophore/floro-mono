
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { Plugin } from "@floro/database/src/entities/Plugin";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import { injectable, inject } from "inversify";
import RepositoryService from "../repositories/RepositoryService";
import RepoRBACService from "../repositories/RepoRBACService";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";

@injectable()
export default class PluginDiscoveryService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repositoryService!: RepositoryService;
  private repoRBACService!: RepoRBACService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepoRBACService) repoRBACService: RepoRBACService,
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repositoryService = repositoryService;
    this.repoRBACService = repoRBACService;
  }

  public async getReposThatUsePlugin(plugin: Plugin, user: User|null|undefined, limit = 5): Promise<Array<Repository>> {
    try {
      const pluginCommitUtilizations = await this.contextFactory.createContext(PluginCommitUtilizationsContext);
      const repositoryIds = await pluginCommitUtilizations.getUtilizedRepositoryIds(plugin.id);
      const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
      const rankedRepos = await repositoriesContext.getRankedRepositories(repositoryIds);

      const branchesContext = await this.contextFactory.createContext(BranchesContext);
      const out: Array<Repository> = [];
      for (let i  = 0; i < rankedRepos.length; ++i) {
        const repoId = rankedRepos[i].repo_id;
        const repository = await this.repositoryService.getRepository(repoId);
        if (!repository) {
          continue;
        }
        const canRead =
          await this.repoRBACService.calculateUserRepositorySettingPermission(
            repository,
            user,
            "anyoneCanRead"
          );
        if (!canRead) {
          continue;
        }

        const defaultBranch = await branchesContext.getByRepoAndBranchId(repository.id, repository.defaultBranchId);
        if (!defaultBranch?.lastCommit) {
          continue;
        }
        const utilizations = await pluginCommitUtilizations.getAllByRepoAndSha(repository.id, defaultBranch?.lastCommit);
        const usedPluginSet = new Set(utilizations.map(u => u.pluginId));
        if (!usedPluginSet.has(plugin.id)) {
          continue;
        }
        out.push(repository);
        if (out.length == limit) {
          return out;
        }
      }
      return out;
    } catch(e) {
      return [];
    }
  }
}