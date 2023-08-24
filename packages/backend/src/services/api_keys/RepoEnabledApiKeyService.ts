import { inject, injectable } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "floro/dist/src/filestructure";
import { Organization } from "@floro/graphql-schemas/build/generated/main-graphql";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import { randomBytes } from "crypto";
import { ApiKey } from "@floro/database/src/entities/ApiKey";
import { Repository } from "@floro/database/src/entities/Repository";
import RepositoryEnabledApiKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledApiKeysContext";

@injectable()
export default class RepoEnabledApiKeyService {
  private contextFactory!: ContextFactory;
  private databaseConnection!: DatabaseConnection;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection
  ) {
    this.contextFactory = contextFactory;
    this.databaseConnection = databaseConnection;
  }

  public async addEnabledApiKey(repository: Repository, apiKey: ApiKey, user: User): Promise<boolean> {
    const repositoryEnabledApiKeysContext = await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const existingEnabledKey = await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(repository.id, apiKey.id);
    if (existingEnabledKey) {
        return true;
    }

    if (repository.repoType == "user_repo") {
      await repositoryEnabledApiKeysContext.create({
        apiKeyId: apiKey.id,
        repositoryId: repository.id,
        userId: repository.userId,
        createdByUserId: user.id,
        apiVersion: "0.0.0"
      });

    } else {
      await repositoryEnabledApiKeysContext.create({
        apiKeyId: apiKey.id,
        repositoryId: repository.id,
        organizationId: repository.organizationId,
        createdByUserId: user.id,
        apiVersion: "0.0.0"
      });
    }
    return true;
  }

  public async removeEnabledApiKey(repository: Repository, apiKey: ApiKey): Promise<boolean> {
    const repositoryEnabledApiKeysContext = await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    await repositoryEnabledApiKeysContext.deleteByRepoAndApiKeyId(repository.id, apiKey.id);
    return true;
  }
}
