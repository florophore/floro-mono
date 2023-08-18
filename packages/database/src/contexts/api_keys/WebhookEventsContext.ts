import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { WebhookEvent } from "../../entities/WebhookEvent";

export default class WebhookEventContext extends BaseContext {
  private webhookEventRepo!: Repository<WebhookEvent>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.webhookEventRepo = this.conn.datasource.getRepository(WebhookEvent);
  }

  public async create(args: DeepPartial<WebhookEvent>): Promise<WebhookEvent> {
    const entity = this.webhookEventRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<WebhookEvent | null> {
    return await this.queryRunner.manager.findOneBy(WebhookEvent, { id });
  }

  public async updateApiKey(
    webhookEvent: WebhookEvent,
    args: DeepPartial<WebhookEvent>
  ): Promise<WebhookEvent | null> {
    return (
      (await this.updateWebhookKeyById(webhookEvent.id, args)) ?? webhookEvent
    );
  }

  public async updateWebhookKeyById(
    id: string,
    args: DeepPartial<WebhookEvent>
  ): Promise<WebhookEvent | null> {
    const webhookEvent = await this.getById(id);
    if (webhookEvent === null) {
      throw new Error("Invalid ID to update for WebhookEvent.id: " + id);
    }
    for (const prop in args) {
      webhookEvent[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(WebhookEvent, webhookEvent);
  }
}