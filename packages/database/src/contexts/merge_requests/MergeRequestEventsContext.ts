import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { MergeRequestEvent } from "../../entities/MergeRequestEvent";

export default class MergeRequestEventsContext extends BaseContext {
  private mergeRequestEventRepo!: Repository<MergeRequestEvent>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.mergeRequestEventRepo = this.conn.datasource.getRepository(MergeRequestEvent);
  }

  public async create(args: DeepPartial<MergeRequestEvent>): Promise<MergeRequestEvent> {
    const entity = this.mergeRequestEventRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<MergeRequestEvent | null> {
    return await this.queryRunner.manager.findOneBy(MergeRequestEvent, { id });
  }
}