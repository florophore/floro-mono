import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { RepoBookmark } from "../../entities/RepoBookmark";
import { Repository as DBRepository } from "../../entities/Repository";

export default class RepoBookmarksContext extends BaseContext {
  private repoBookmarkRepo!: Repository<RepoBookmark>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoBookmarkRepo = this.conn.datasource.getRepository(RepoBookmark);
  }

  public async create(args: DeepPartial<RepoBookmark>): Promise<RepoBookmark> {
    const entity = this.repoBookmarkRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoBookmark | null> {
    return await this.queryRunner.manager.findOneBy(RepoBookmark, { id });
  }
  public async getByUserIdAndRepoId(
    userId: string,
    repositoryId: string
  ): Promise<RepoBookmark | null> {
    return await this.queryRunner.manager.findOneBy(RepoBookmark, {
      userId,
      repositoryId,
    });
  }

  public async deleteBookmark(
    userId: string,
    repositoryId: string
  ): Promise<void> {
    await this.queryRunner.manager.delete(RepoBookmark, {
      userId,
      repositoryId,
    });
  }

  public async getBookmarkedRepositoriesForUser(
    userId: string,
  ): Promise<DBRepository[]> {
    const bookmarks =  await this.queryRunner.manager.find(RepoBookmark, {
      where: {
        userId,
      },
      relations: {
        repository: {
          user: {
            profilePhoto: true
          },
          organization: {
            profilePhoto: true
          }
        }
      }
    });
    return bookmarks.map(bookmark => bookmark.repository as DBRepository);
  }
}
