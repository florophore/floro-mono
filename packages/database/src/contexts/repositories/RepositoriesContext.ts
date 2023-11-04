import {
  DeepPartial,
  In,
  QueryRunner,
  Repository as TypeormRepository,
} from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { Repository } from "../../entities/Repository";

export default class RepositoriesContext extends BaseContext {
  private repositoryRepo!: TypeormRepository<Repository>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repositoryRepo = this.conn.datasource.getRepository(Repository);
  }

  public async createRepo(
    repoArgs: DeepPartial<Repository>
  ): Promise<Repository> {
    const repoEntity = this.repositoryRepo.create(repoArgs);
    return await this.queryRunner.manager.save(repoEntity);
  }

  public async getById(id: string): Promise<Repository | null> {
    return await this.queryRunner.manager.findOne(Repository, {
      where: { id },
      relations: {
        user: {
          profilePhoto: true,
        },
        organization: {
          profilePhoto: true,
        },
      },
    });
  }

  public async getByHashKey(hashKey: string): Promise<Repository | null> {
    return await this.queryRunner.manager.findOne(Repository, {
      where: { hashKey },
      relations: {
        user: {
          profilePhoto: true,
        },
        organization: {
          profilePhoto: true,
        },
      },
    });
  }

  public async getUserRepos(userId: string): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { userId },
      relations: {
        user: {
          profilePhoto: true,
        },
        organization: {
          profilePhoto: true,
        },
      },
    });
  }

  public async getUserReposByType(
    userId: string,
    isPrivate: boolean
  ): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { userId, isPrivate },
      relations: {
        user: {
          profilePhoto: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  public async getOrgRepos(organizationId: string): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { organizationId },
      relations: {
        organization: {
          profilePhoto: true,
        },
      },
    });
  }

  public async getOrgReposByType(
    organizationId: string,
    isPrivate: boolean
  ): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { organizationId, isPrivate },
      relations: {
        organization: {
          profilePhoto: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
  public async updateRepo(
    repo: Repository,
    repoArgs: DeepPartial<Repository>
  ): Promise<Repository> {
    return (await this.updateRepoById(repo.id, repoArgs)) ?? repo;
  }

  public async updateRepoById(
    id: string,
    repoArgs: DeepPartial<Repository>
  ): Promise<Repository | null> {
    const repo = await this.getById(id);
    if (repo === null) {
      throw new Error("Invalid ID to update for Repository.id: " + id);
    }
    for (const prop in repoArgs) {
      repo[prop] = repoArgs[prop];
    }
    return await this.queryRunner.manager.save(Repository, repo);
  }

  public async searchRepos(query: string, limit = 5): Promise<Repository[]> {
    const qb = this.repositoryRepo.createQueryBuilder("repo", this.queryRunner);
    return await qb
      .leftJoinAndSelect("repo.user", "user")
      .leftJoinAndSelect("repo.organization", "organization")
      .where(
        `(repo.name ILIKE :query || '%') OR (repo.name ILIKE :query || '%')`
      )
      .setParameter("query", query.trim().toLowerCase())
      .limit(limit)
      .orderBy(`LENGTH(repo.name)`, "ASC")
      .getMany();
  }

  public async getPublicReposWithCommit(): Promise<Repository[]> {
    const qb = this.repositoryRepo.createQueryBuilder("repo", this.queryRunner);
    return await qb
      .leftJoinAndSelect(
        "repo.branches",
        "branches",
        "branches.branch_id = repo.default_branch_id AND branches.repository_id = repo.id"
      )
      .leftJoinAndSelect("repo.user", "user")
      .leftJoinAndSelect("repo.organization", "organization")
      .where(
        `repo.is_private = false`
      )
      .andWhere(
        `branches.last_commit IS NOT NULL`
      )
      .orderBy(`repo.created_at`, "DESC")
      .getMany();
  }

  public async getRankedRepositories(repositoryIds: string[]): Promise<Array<{repo_id: string, ranked_usage: number}>> {
    const result: Array<{repo_id: string, ranked_usage: number}> = await this.repositoryRepo
      .createQueryBuilder("repo")
      .select('repo.id')
      .addSelect('repo.bookmark_count + repo.subscription_count', 'ranked_usage')
      .where({ id: In(repositoryIds) })
      .orderBy('ranked_usage', 'DESC')
      .getRawMany();
      return result;
  }
}
