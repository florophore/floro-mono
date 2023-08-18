import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { RepositoryEnabledApiKey } from "../../entities/RepositoryEnabledApiKey";

export default class RepositoryEnabledApiKeysContext extends BaseContext {
  private repositoryEnabledApiKeyRepo!: Repository<RepositoryEnabledApiKey>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repositoryEnabledApiKeyRepo = this.conn.datasource.getRepository(RepositoryEnabledApiKey);
  }

  public async create(args: DeepPartial<RepositoryEnabledApiKey>): Promise<RepositoryEnabledApiKey> {
    const entity = this.repositoryEnabledApiKeyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepositoryEnabledApiKey | null> {
    return await this.queryRunner.manager.findOneBy(RepositoryEnabledApiKey, { id });
  }

  public async updateRepositoryEnabledApiKey(
    repositoryEnabledApiKey: RepositoryEnabledApiKey,
    args: DeepPartial<RepositoryEnabledApiKey>
  ): Promise<RepositoryEnabledApiKey | null> {
    return (
      (await this.updateRepositoryEnabledApiKeyById(repositoryEnabledApiKey.id, args)) ?? repositoryEnabledApiKey
    );
  }

  public async updateRepositoryEnabledApiKeyById(
    id: string,
    args: DeepPartial<RepositoryEnabledApiKey>
  ): Promise<RepositoryEnabledApiKey | null> {
    const repositoryEnabledApiKey = await this.getById(id);
    if (repositoryEnabledApiKey === null) {
      throw new Error("Invalid ID to update for RepositoryEnabledApiKey.id: " + id);
    }
    for (const prop in args) {
      repositoryEnabledApiKey[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(RepositoryEnabledApiKey, repositoryEnabledApiKey);
  }
}