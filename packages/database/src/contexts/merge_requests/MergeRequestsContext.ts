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
    return await this.queryRunner.manager.findOne(MergeRequest, {
      where: { id },
      relations: {
        openedByUser: {
          profilePhoto: true,
        },
      },
    });
  }

  public async getAllOpenMergeRequests(
    repositoryId: string
  ): Promise<MergeRequest[]> {
    return await this.queryRunner.manager.find(MergeRequest, {
      where: {
        repositoryId,
        isOpen: true,
      },
      order: {
        mergeRequestCount: 'DESC'
      },
      relations: {
        openedByUser: {
          profilePhoto: true
        }
      }
    });
  }

  public async getAllClosedMergeRequests(
    repositoryId: string
  ): Promise<MergeRequest[]> {
    return await this.queryRunner.manager.find(MergeRequest, {
      where: {
        repositoryId,
        isOpen: false,
      },
      order: {
        mergeRequestCount: 'DESC'
      },
      relations: {
        openedByUser: {
          profilePhoto: true
        }
      }
    });
  }

  public async getOpenMergeRequestByBranchNameAndRepo(
    repositoryId: string,
    branchId: string,
  ): Promise<MergeRequest | null> {
    return await this.queryRunner.manager.findOne(MergeRequest, {
      where: {
        branchId,
        repositoryId,
        isOpen: true,
      },
      relations: {
        openedByUser: {
          profilePhoto: true
        }
      }
    });
  }

  public async countMergeRequestsByRepo(
    repositoryId: string
  ): Promise<number> {
    const [, count] = await this.queryRunner.manager.findAndCount(
      MergeRequest,
      {
        where: {
          repositoryId,
        },
      }
    );
    return count;
  }

  public async repoHasOpenRequestOnBranch(
    repositoryId: string,
    branchId: string
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(
      MergeRequest,
      {
        where: {
          branchId,
          repositoryId,
          isOpen: true,
        },
      }
    );
    return count > 0;
  }

  public async updateMergeRequest(
    mergeRequest: MergeRequest,
    mergeRequestArgs: DeepPartial<MergeRequest>
  ): Promise<MergeRequest> {
    return (await this.updateMergeRequestById(mergeRequest.id, mergeRequestArgs)) ?? mergeRequest;
  }

  public async updateMergeRequestById(
    id: string,
    mergeRequestArgs: DeepPartial<MergeRequest>
  ): Promise<MergeRequest | null> {
    const mergeRequest = await this.getById(id);
    if (mergeRequest === null) {
      throw new Error("Invalid ID to update for MergeRequest.id: " + id);
    }
    for (const prop in mergeRequestArgs) {
      mergeRequest[prop] = mergeRequestArgs[prop];
    }
    return await this.queryRunner.manager.save(MergeRequest, mergeRequest);
  }
}
