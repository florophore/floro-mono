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

  public async updateMergeRequestComment(
    mergeRequestComment: MergeRequestComment,
    mergeRequestCommentArgs: DeepPartial<MergeRequestComment>
  ): Promise<MergeRequestComment> {
    return (await this.updateMergeRequestCommentById(mergeRequestComment.id, mergeRequestCommentArgs)) ?? mergeRequestComment;
  }

  public async updateMergeRequestCommentById(
    id: string,
    mergeRequestCommentArgs: DeepPartial<MergeRequestComment>
  ): Promise<MergeRequestComment | null> {
    const mergeRequestComment = await this.getById(id);
    if (mergeRequestComment === null) {
      throw new Error("Invalid ID to update for MergeRequestComment.id: " + id);
    }
    for (const prop in mergeRequestCommentArgs) {
      mergeRequestComment[prop] = mergeRequestCommentArgs[prop];
    }
    return await this.queryRunner.manager.save(MergeRequestComment, mergeRequestComment);
  }

  public async getMergeRequestComments(
    mergeRequestId: string
  ): Promise<Array<MergeRequestComment>> {
    const comments = await this.queryRunner.manager.find(MergeRequestComment, {
      where: {
        mergeRequestId,
        isDeleted: false,
      },
      order: {
        createdAt: 'ASC',
        replies: {
          createdAt: 'DESC',
        }
      },
      relations: {
        user: {
          profilePhoto: true
        },
        pluginVersion: true,
        replies: {
          user: {
            profilePhoto: true
          }
        }
      }
    });
    return (
      (comments?.map?.((c) => {
        return {
          ...c,
          replies: c.replies
            .filter((r) => !r.isDeleted)
            .sort((a, b) =>
              new Date(a.createdAt) >= new Date(b.createdAt) ? 1 : -1
            ),
        };
      }) as Array<MergeRequestComment>) ?? []
    ).sort((a, b) => (new Date(a.createdAt) >= new Date(b.createdAt) ? 1 : -1));
  }
}