import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { MergeRequestCommentReply } from "../../entities/MergeRequestCommentReply";
import { RepoAnnouncementReply } from "../../entities/RepoAnnouncementReply";

export default class RepoAnnouncementRepliesContext extends BaseContext {
  private repoAnnouncementReplyRepo!: Repository<RepoAnnouncementReply>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoAnnouncementReplyRepo = this.conn.datasource.getRepository(RepoAnnouncementReply);
  }

  public async create(args: DeepPartial<RepoAnnouncementReply>): Promise<RepoAnnouncementReply> {
    const entity = this.repoAnnouncementReplyRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoAnnouncementReply | null> {
    return await this.queryRunner.manager.findOneBy(RepoAnnouncementReply, { id });
  }

  public async updateRepoAnnouncementReply(
    repoAnnouncementReply: RepoAnnouncementReply,
    repoAnnouncementReplyArgs: DeepPartial<RepoAnnouncementReply>
  ): Promise<RepoAnnouncementReply> {
    return (await this.updateRepoAnnouncementReplyById(repoAnnouncementReply.id, repoAnnouncementReplyArgs)) ?? repoAnnouncementReply;
  }

  public async updateRepoAnnouncementReplyById(
    id: string,
    repoAnnouncementReplyArgs: DeepPartial<RepoAnnouncementReply>
  ): Promise<RepoAnnouncementReply | null> {
    const repoAnnouncementReply = await this.getById(id);
    if (repoAnnouncementReply === null) {
      throw new Error("Invalid ID to update for RepoAnnouncementRepliesContext.id: " + id);
    }
    for (const prop in repoAnnouncementReplyArgs) {
      repoAnnouncementReply[prop] = repoAnnouncementReplyArgs[prop];
    }
    return await this.queryRunner.manager.save(RepoAnnouncementReply, repoAnnouncementReply);
  }
}