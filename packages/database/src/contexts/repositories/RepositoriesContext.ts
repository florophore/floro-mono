import { DeepPartial, QueryRunner, Repository as TypeormRepository } from "typeorm";
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
        user: true,
        organization: true,
      }
    });
  }

  public async getByHashKey(hashKey: string): Promise<Repository | null> {
    return await this.queryRunner.manager.findOne(Repository, {
      where: { hashKey },
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async getUserRepos(userId: string): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { userId },
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async getUserReposByType(userId: string, isPrivate: boolean): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { userId, isPrivate },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  public async getOrgRepos(organizationId: string): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { organizationId },
      relations: {
        organization: true,
      }
    });
  }

  public async getOrgReposByType(organizationId: string, isPrivate: boolean): Promise<Repository[]> {
    return await this.queryRunner.manager.find(Repository, {
      where: { organizationId, isPrivate },
      relations: {
        organization: true,
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }
}