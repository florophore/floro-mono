import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { MergeRequest } from "../../entities/MergeRequest";

export default class MergeRequestsContext extends BaseContext {
  private mergeRequestRepo!: Repository<MergeRequest>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.mergeRequestRepo = this.conn.datasource.getRepository(MergeRequest);
  }

  public async create(args: DeepPartial<MergeRequest>): Promise<MergeRequest> {
    const entity = this.mergeRequestRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<MergeRequest | null> {
    return await this.queryRunner.manager.findOneBy(MergeRequest, { id });
  }
}