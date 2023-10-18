
import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import RepoDataService from "./RepoDataService";

@injectable()
export default class RepoSearchService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(RepoDataService) repoDataService: RepoDataService,
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
  }

  public async searchRepoForUser(query: string, user: User) {
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repos = await repositoriesContext.searchRepos(query);
    const out: Array<Repository> = [];
    for (const repo of repos) {
        const userSettings = await this.repoDataService.fetchRepoSettingsForUser(repo.id, user);
        if (userSettings?.canReadRepo) {
            out.push(repo);
        }
    }
    return out;
  }
}