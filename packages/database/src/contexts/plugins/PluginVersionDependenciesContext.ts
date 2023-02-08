
import { DeepPartial, QueryRunner, Repository as TypeormRepository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { PluginVersionDependency } from "../../entities/PluginVersionDependency";

export default class PluginsVersionDependenciesContext extends BaseContext {
  private pluginVersionDependencyRepo!: TypeormRepository<PluginVersionDependency>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.pluginVersionDependencyRepo = this.conn.datasource.getRepository(PluginVersionDependency);
  }

  public async createPluginVersionDependency(
    pluginVersionDependencyArgs: DeepPartial<PluginVersionDependency>
  ): Promise<PluginVersionDependency> {
    const pluginVersionDependencyEntity = this.pluginVersionDependencyRepo.create(pluginVersionDependencyArgs);
    return await this.queryRunner.manager.save(pluginVersionDependencyEntity);
  }

  public async getById(id: string): Promise<PluginVersionDependency | null> {
    return await this.queryRunner.manager.findOne(PluginVersionDependency, {
      where: { id },
    });
  }

  public async getDependenciesByUploadHash(uploadHash: string): Promise<PluginVersionDependency[]> {
    return await this.queryRunner.manager.find(PluginVersionDependency, {
      where: { pluginUploadHash: uploadHash },
      relations: {
        dependencyPluginVersion: true,
      }
    });
  }

  public async getDependentsByUploadHash(uploadHash: string): Promise<PluginVersionDependency[]> {
    return await this.queryRunner.manager.find(PluginVersionDependency, {
      where: { pluginUploadHash: uploadHash },
      relations: {
        pluginVersion: true,
      }
    });
  }
}