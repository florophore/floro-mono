import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { MergeRequestCommentReply } from "../../entities/MergeRequestCommentReply";

export default class MergeRequestCommentRepliesContext extends BaseContext {
  private mergeRequestCommentReplyRepo!: Repository<MergeRequestCommentReply>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.mergeRequestCommentReplyRepo = this.conn.datasource.getRepository(MergeRequestCommentReply);
  }

  public async create(args: DeepPartial<MergeRequestCommentReply>): Promise<MergeRequestCommentReply> {
    const entity = this.mergeRequestCommentReplyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<MergeRequestCommentReply | null> {
    return await this.queryRunner.manager.findOneBy(MergeRequestCommentReply, { id });
  }
}