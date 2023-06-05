import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Branch } from "../../entities/Branch";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class BranchesContext extends BaseContext {
  private branchRepo!: Repository<Branch>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.branchRepo = this.conn.datasource.getRepository(Branch);
  }

  public async create(branchArgs: DeepPartial<Branch>): Promise<Branch> {
    const branchEntity = this.branchRepo.create(branchArgs);
    return await this.queryRunner.manager.save(branchEntity);
  }

  public async getById(id: string): Promise<Branch | null> {
    return await this.queryRunner.manager.findOneBy(Branch, { id });
  }

  public async getByRepoAndBranchId(
    repositoryId: string,
    branchId: string
  ): Promise<Branch | null> {
    return await this.queryRunner.manager.findOneBy(Branch, {
      branchId,
      repositoryId,
    });
  }

  public async getAllByRepoId(repositoryId: string): Promise<Branch[]> {
    return await this.queryRunner.manager.find(Branch, {
      where: {
        repositoryId,
        isDeleted: false
      },
    });
  }

  public async updateBranch(
    branch: Branch,
    branchArgs: DeepPartial<Branch>
  ): Promise<Branch> {
    return (
      (await this.updateBranchByDbId(
        branch.id,
        branchArgs
      )) ?? branch
    );
  }

  public async updateBranchByDbId(
    id: string,
    branchArgs: DeepPartial<Branch>
  ): Promise<Branch | null> {
    const branch = await this.getById(id);
    if (branch === null) {
      throw new Error("Invalid ID to update for Branch.id: " + id);
    }
    for (const prop in branchArgs) {
      branch[prop] = branchArgs[prop];
    }
    return await this.queryRunner.manager.save(Branch, branch);
  }
}
