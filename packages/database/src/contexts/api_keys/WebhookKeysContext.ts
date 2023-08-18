import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { ApiKey } from "../../entities/ApiKey";
import { WebhookKey } from "../../entities/WebhookKey";

export default class WebhookKeysContext extends BaseContext {
  private webhookKeyRepo!: Repository<WebhookKey>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.webhookKeyRepo = this.conn.datasource.getRepository(WebhookKey);
  }

  public async create(args: DeepPartial<WebhookKey>): Promise<WebhookKey> {
    const entity = this.webhookKeyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<WebhookKey | null> {
    return await this.queryRunner.manager.findOneBy(WebhookKey, { id });
  }

  public async getBySecret(secret: string): Promise<WebhookKey | null> {
    return await this.queryRunner.manager.findOneBy(WebhookKey, { secret });
  }

  public async getByDNSVerificationCode(dnsVerificationCode: string): Promise<WebhookKey | null> {
    return await this.queryRunner.manager.findOneBy(WebhookKey, { dnsVerificationCode });
  }

  public async getUserWebhookKeys(userId: string): Promise<WebhookKey[]> {
    return await this.queryRunner.manager.find(WebhookKey, {
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

  public async getOrganizationWebhookKeys(organizationId: string): Promise<WebhookKey[]> {
    return await this.queryRunner.manager.find(WebhookKey, {
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

  public async updateWebhookKey(
    webhookKey: WebhookKey,
    args: DeepPartial<WebhookKey>
  ): Promise<ApiKey | null> {
    return (
      (await this.updateWebhookKeyById(webhookKey.id, args)) ?? webhookKey
    );
  }

  public async updateWebhookKeyById(
    id: string,
    args: DeepPartial<WebhookKey>
  ): Promise<WebhookKey | null> {
    const webhookKey = await this.getById(id);
    if (webhookKey === null) {
      throw new Error("Invalid ID to update for WebhookKey.id: " + id);
    }
    for (const prop in args) {
      webhookKey[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(WebhookKey, webhookKey);
  }
}