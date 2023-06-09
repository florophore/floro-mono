import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { BinaryCommitUtilization } from "../../entities/BinaryCommitUtilization";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class BinaryCommitUtilizationsContext extends BaseContext {
  private binaryCommitUtilizationRepo!: Repository<BinaryCommitUtilization>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.binaryCommitUtilizationRepo = this.conn.datasource.getRepository(BinaryCommitUtilization);
  }

  public async create(pluginRepoUtilizationArgs: DeepPartial<BinaryCommitUtilization>): Promise<BinaryCommitUtilization> {
    const entity = this.binaryCommitUtilizationRepo.create(pluginRepoUtilizationArgs);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<BinaryCommitUtilization | null> {
    return await this.queryRunner.manager.findOneBy(BinaryCommitUtilization, { id });
  }

  public async getAllByRepoAndSha(repositoryId: string, commitSha: string): Promise<Array<BinaryCommitUtilization>> {
    return await this.queryRunner.manager.find(BinaryCommitUtilization, {
      where: {
        commitSha,
        repositoryId
      }
    });
  }
}