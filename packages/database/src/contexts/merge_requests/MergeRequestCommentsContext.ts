import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { MergeRequestComment } from "../../entities/MergeRequestComment";

export default class MergeRequestCommentsContext extends BaseContext {
  private mergeRequestCommentRepo!: Repository<MergeRequestComment>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.mergeRequestCommentRepo = this.conn.datasource.getRepository(MergeRequestComment);
  }

  public async create(args: DeepPartial<MergeRequestComment>): Promise<MergeRequestComment> {
    const entity = this.mergeRequestCommentRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<MergeRequestComment | null> {
    return await this.queryRunner.manager.findOneBy(MergeRequestComment, { id });
  }
}