import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { RepositoryEnabledWebhookKey } from "../../entities/RepositoryEnabledWebhookKey";

export default class RepositoryEnabledWebhookKeysContext extends BaseContext {
  private repositoryEnabledWebhookKeyRepo!: Repository<RepositoryEnabledWebhookKey>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repositoryEnabledWebhookKeyRepo = this.conn.datasource.getRepository(RepositoryEnabledWebhookKey);
  }

  public async create(args: DeepPartial<RepositoryEnabledWebhookKey>): Promise<RepositoryEnabledWebhookKey> {
    const entity = this.repositoryEnabledWebhookKeyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepositoryEnabledWebhookKey | null> {
    return await this.queryRunner.manager.findOneBy(RepositoryEnabledWebhookKey, { id });
  }

  public async deleteById(id: string): Promise<boolean> {
    try {
     await this.queryRunner.manager.delete(RepositoryEnabledWebhookKey, { id });
     return true;
    } catch(e) {
      return false
    }
  }

  public async updateRepositoryEnabledWebhookKey(
    repositoryEnabledApiKey: RepositoryEnabledWebhookKey,
    args: DeepPartial<RepositoryEnabledWebhookKey>
  ): Promise<RepositoryEnabledWebhookKey | null> {
    return (
      (await this.updateRepositoryEnabledWebhookKeyById(repositoryEnabledApiKey.id, args)) ?? repositoryEnabledApiKey
    );
  }

  public async getRepositoryWebhookKeys(repositoryId: string): Promise<RepositoryEnabledWebhookKey[]> {
    return await this.queryRunner.manager.find(RepositoryEnabledWebhookKey, {
      where: {
        repositoryId,
        webhookKey: {
          isDeleted: false
        }
      },
      relations: {
        webhookKey: true
      },
      order: {
        createdAt: 'DESC'
      },
    });
  }

  public async updateRepositoryEnabledWebhookKeyById(
    id: string,
    args: DeepPartial<RepositoryEnabledWebhookKey>
  ): Promise<RepositoryEnabledWebhookKey | null> {
    const repositoryEnabledWebhookKey = await this.getById(id);
    if (repositoryEnabledWebhookKey === null) {
      throw new Error("Invalid ID to update for RepositoryEnabledWebhookKey.id: " + id);
    }
    for (const prop in args) {
      repositoryEnabledWebhookKey[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(RepositoryEnabledWebhookKey, repositoryEnabledWebhookKey);
  }
}