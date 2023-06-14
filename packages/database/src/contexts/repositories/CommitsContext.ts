import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Commit } from "../../entities/Commit";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class CommitsContext extends BaseContext {
  private commitRepo!: Repository<Commit>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.commitRepo = this.conn.datasource.getRepository(Commit);
  }

  public async create(commitArgs: DeepPartial<Commit>): Promise<Commit> {
    const commitEntity = this.commitRepo.create(commitArgs);
    return await this.queryRunner.manager.save(commitEntity);
  }

  public async getById(id: string): Promise<Commit | null> {
    return await this.queryRunner.manager.findOneBy(Commit, { id });
  }

  public async getAllByRepoId(repositoryId: string): Promise<Commit[]> {
    return await this.queryRunner.manager.find(Commit, {
      where: {
        repositoryId,
      },
      relations: { user: { profilePhoto: true } },
      order: {
        idx: "ASC",
      },
    });
  }

  public async getCommitBySha(repositoryId: string, sha: string): Promise<Commit|null> {
    return await this.queryRunner.manager.findOne(Commit, {
      where: {
        repositoryId,
        sha
      },
      relations: { user: { profilePhoto: true } },
    });
  }
  public async repoHasCommit(repositoryId: string, sha: string): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(Commit, {
        where: {
            sha,
            repositoryId
        }
    });
    return count > 0;
  }
}