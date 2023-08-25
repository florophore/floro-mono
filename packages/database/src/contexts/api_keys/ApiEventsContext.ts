import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { ApiEvent } from "../../entities/ApiEvent";
import { User } from "../../entities/User";
import { Organization } from "../../entities/Organization";

export default class ApiEventsContext extends BaseContext {
  private apiEventRepo!: Repository<ApiEvent>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.apiEventRepo = this.conn.datasource.getRepository(ApiEvent);
  }

  public async create(args: DeepPartial<ApiEvent>): Promise<ApiEvent> {
    const entity = this.apiEventRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ApiEvent | null> {
    return await this.queryRunner.manager.findOneBy(ApiEvent, { id });
  }

  public async updateApiKey(
    apiEvent: ApiEvent,
    args: DeepPartial<ApiEvent>
  ): Promise<ApiEvent | null> {
    return (
      (await this.updateApiKeyById(apiEvent.id, args)) ?? apiEvent
    );
  }

  public async updateApiKeyById(
    id: string,
    args: DeepPartial<ApiEvent>
  ): Promise<ApiEvent | null> {
    const apiEvent = await this.getById(id);
    if (apiEvent === null) {
      throw new Error("Invalid ID to update for ApiEvent.id: " + id);
    }
    for (const prop in args) {
      apiEvent[prop] = args[prop];
    }
    return await this.queryRunner.manager.save(ApiEvent, apiEvent);
  }

}