import { inject, injectable } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "floro/dist/src/filestructure";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import { randomBytes } from "crypto";
import { Repository } from "@floro/database/src/entities/Repository";
import { WebhookKey } from "@floro/database/src/entities/WebhookKey";
import { RepositoryEnabledWebhookKey } from "@floro/database/src/entities/RepositoryEnabledWebhookKey";
import { SUBDOMAIN, URI_PATH } from "@floro/common-web/src/utils/validators";
import RepositoryEnabledWebhookKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledWebhookKeysContext";

@injectable()
export default class RepoEnabledWebhookKeyService {
  private contextFactory!: ContextFactory;
  private databaseConnection!: DatabaseConnection;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection
  ) {
    this.contextFactory = contextFactory;
    this.databaseConnection = databaseConnection;
  }

  public async addEnabledWebhookKey(
    repository: Repository,
    user: User,
    webhookKey: WebhookKey,
    protocol: string | null,
    port: number | null,
    subdomain: string| null,
    uri: string | null
  ): Promise<boolean> {
    if (subdomain && !SUBDOMAIN.test(subdomain)) {
      return false;
    }
    if (uri && !URI_PATH.test(uri)) {
      return false;
    }
    if (protocol != "http" && protocol != "https") {
      return false;
    }
    if (port && (port < 1 || port > 0xFFFF)) {
      return false;
    }
    const repositoryEnabledWebhookKeysContext =
      await this.contextFactory.createContext(
        RepositoryEnabledWebhookKeysContext
      );
    await repositoryEnabledWebhookKeysContext.create({
      port: port ?? undefined,
      protocol,
      subdomain: subdomain ?? undefined,
      uri: uri ?? undefined,
      repositoryId: repository.id,
      createdByUserId: user.id,
      webhookKeyId: webhookKey.id,
    });
    return true;

  }

  public async updateEnabledWebhookKey(
    repoEnabledWebhookKey: RepositoryEnabledWebhookKey,
    webhookKey: WebhookKey,
    protocol: string | null,
    port: number | null,
    subdomain: string | null,
    uri: string | null
  ): Promise<boolean> {
    if (subdomain && !SUBDOMAIN.test(subdomain)) {
      return false;
    }
    if (uri && !URI_PATH.test(uri)) {
      return false;
    }
    if (protocol != "http" && protocol != "https") {
      return false;
    }
    if (port && (port < 1 || port > 0xFFFF)) {
      return false;
    }

    const repositoryEnabledWebhookKeysContext =
      await this.contextFactory.createContext(
        RepositoryEnabledWebhookKeysContext
      );

    await repositoryEnabledWebhookKeysContext.updateRepositoryEnabledWebhookKey(
      repoEnabledWebhookKey,
      {
        port: port ?? null,
        protocol,
        subdomain: subdomain ?? null,
        uri: uri ?? null,
        webhookKeyId: webhookKey.id,
      }
    )
    return true;
  }

  public async removeEnabledApiKey(repoEnabledWebhookKey: RepositoryEnabledWebhookKey) {
    const repositoryEnabledWebhookKeysContext =
      await this.contextFactory.createContext(
        RepositoryEnabledWebhookKeysContext
      );
    return await repositoryEnabledWebhookKeysContext.deleteById(repoEnabledWebhookKey.id);
  }
}
