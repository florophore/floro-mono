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

  public async updateMergeRequestCommentReply(
    mergeRequestCommentReply: MergeRequestCommentReply,
    mergeRequestCommentReplyArgs: DeepPartial<MergeRequestCommentReply>
  ): Promise<MergeRequestCommentReply> {
    return (await this.updateMergeRequestCommentReplyById(mergeRequestCommentReply.id, mergeRequestCommentReplyArgs)) ?? mergeRequestCommentReply;
  }

  public async updateMergeRequestCommentReplyById(
    id: string,
    mergeRequestCommentReplyArgs: DeepPartial<MergeRequestCommentReply>
  ): Promise<MergeRequestCommentReply | null> {
    const mergeRequestCommentReply = await this.getById(id);
    if (mergeRequestCommentReply === null) {
      throw new Error("Invalid ID to update for MergeRequestCommentReply.id: " + id);
    }
    for (const prop in mergeRequestCommentReplyArgs) {
      mergeRequestCommentReply[prop] = mergeRequestCommentReplyArgs[prop];
    }
    return await this.queryRunner.manager.save(MergeRequestCommentReply, mergeRequestCommentReply);
  }
}