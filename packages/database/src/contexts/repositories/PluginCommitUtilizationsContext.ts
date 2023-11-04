import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { PluginCommitUtilization } from "../../entities/PluginCommitUtilization";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class PluginCommitUtilizationsContext extends BaseContext {
  private pluginCommitUtilization!: Repository<PluginCommitUtilization>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.pluginCommitUtilization = this.conn.datasource.getRepository(PluginCommitUtilization);
  }

  public async create(pluginRepoUtilizationArgs: DeepPartial<PluginCommitUtilization>): Promise<PluginCommitUtilization> {
    const entity = this.pluginCommitUtilization.create(pluginRepoUtilizationArgs);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<PluginCommitUtilization | null> {
    return await this.queryRunner.manager.findOneBy(PluginCommitUtilization, { id });
  }

  public async getAllByRepoAndSha(repositoryId: string, commitSha: string): Promise<Array<PluginCommitUtilization>> {
    return await this.queryRunner.manager.find(PluginCommitUtilization, {
      where: {
        commitSha,
        repositoryId
      }
    });
  }

  public async getUtilizedRepositoryIds(pluginId: string): Promise<string[]> {
    const result: {utilization_repository_id: string}[] = await this.pluginCommitUtilization
      .createQueryBuilder("utilization")
      .select("utilization.repositoryId")
      .where({ pluginId })
      .distinctOn(["utilization.repositoryId"])
      .getRawMany();
    return result.map(r => r.utilization_repository_id);
  }
}