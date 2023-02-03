import { DeepPartial, QueryRunner, Repository as TypeormRepository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { PluginVersion } from "../../entities/PluginVersion";
import PluginHelper from "../utils/PluginHelper";

export default class PluginsVersionsContext extends BaseContext {
  private pluginVersionRepo!: TypeormRepository<PluginVersion>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.pluginVersionRepo = this.conn.datasource.getRepository(PluginVersion);
  }

  public async createPluginVersion(
    pluginVersionArgs: DeepPartial<PluginVersion>
  ): Promise<PluginVersion> {
    const pluginVersionEntity = this.pluginVersionRepo.create(pluginVersionArgs);
    return await this.queryRunner.manager.save(pluginVersionEntity);
  }

  public async getById(id: string): Promise<PluginVersion | null> {
    return await this.queryRunner.manager.findOne(PluginVersion, {
      where: { id },
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async getByNameAndVersion(name: string, version: string): Promise<PluginVersion | null> {
    return await this.queryRunner.manager.findOne(PluginVersion, {
      where: { name, version },
      relations: {
        dependencies: true,
      }
    });
  }

  public async getByName(name?: string): Promise<PluginVersion[]> {
    if (!name) {
      return [];
    }
    const nameKey = PluginHelper.getPluginKeyUUID(name);
    if (!nameKey) {
      return [];
    }
    return await this.queryRunner.manager.find(PluginVersion, {
      where: { nameKey },
      relations: {
        dependencies: true,
      }
    });
  }

  public async getByPlugin(pluginId: string): Promise<PluginVersion[]> {
    return await this.queryRunner.manager.find(PluginVersion, {
      where: { pluginId },
      relations: {
        dependencies: true,
      }
    });
  }
}