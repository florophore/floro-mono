import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { ApiKey } from "../../entities/ApiKey";

export default class ApiKeysContext extends BaseContext {
  private apiKeyRepo!: Repository<ApiKey>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.apiKeyRepo = this.conn.datasource.getRepository(ApiKey);
  }

  public async create(args: DeepPartial<ApiKey>): Promise<ApiKey> {
    const entity = this.apiKeyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ApiKey | null> {
    return await this.queryRunner.manager.findOneBy(ApiKey, { id });
  }

  public async getBySecret(secret: string): Promise<ApiKey | null> {
    return await this.queryRunner.manager.findOneBy(ApiKey, { secret });
  }

  public async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await this.queryRunner.manager.find(ApiKey, {
      where: {
        userId,
        keyType: "user_key",
        isDeleted: false
      },
      order: {
        createdAt: 'ASC'
      },
    });
  }

  public async getOrganizationApiKeys(organizationId: string): Promise<ApiKey[]> {
    return await this.queryRunner.manager.find(ApiKey, {
      where: {
        organizationId,
        keyType: "org_key",
        isDeleted: false
      },
      order: {
        createdAt: 'ASC'
      },
    });
  }

  public async updateApiKey(
    apiKey: ApiKey,
    args: DeepPartial<ApiKey>
  ): Promise<ApiKey | null> {
    return (await this.updateApiKeyById(apiKey.id, args)) ?? apiKey;
  }

  public async updateApiKeyById(
    id: string,
    args: DeepPartial<ApiKey>
  ): Promise<ApiKey | null> {
    const apiKey = await this.getById(id);
    if (apiKey === null) {
      throw new Error("Invalid ID to update for ApiKey.id: " + id);
    }
    for (const prop in args) {
      apiKey[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(ApiKey, apiKey);
  }
}
