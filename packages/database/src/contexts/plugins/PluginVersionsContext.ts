import { DeepPartial, In, QueryRunner, Repository as TypeormRepository } from "typeorm";
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
    const pluginVersionEntity =
      this.pluginVersionRepo.create(pluginVersionArgs);
    return await this.queryRunner.manager.save(pluginVersionEntity);
  }

  public async getById(id: string): Promise<PluginVersion | null> {
    return await this.queryRunner.manager.findOne(PluginVersion, {
      where: { id },
      relations: {
        user: true,
        organization: true,
        dependencies: {
          dependencyPluginVersion: {
            user: true,
            organization: true,
          }
        },
      },
    });
  }

  public async getByNameAndVersion(
    name: string,
    version: string
  ): Promise<PluginVersion | null> {
    return await this.queryRunner.manager.findOne(PluginVersion, {
      where: { name, version },
      relations: {
        user: true,
        organization: true,
        dependencies: {
          dependencyPluginVersion: {
            user: true,
            organization: true,
          }
        },
      },
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
        user: true,
        organization: true,
        dependencies: {
          dependencyPluginVersion: {
            user: true,
            organization: true,
          }
        },
      },
    });
  }

  public async getByPlugin(pluginId: string): Promise<PluginVersion[]> {
    return await this.queryRunner.manager.find(PluginVersion, {
      where: { pluginId },
      relations: {
        user: true,
        organization: true,
        dependencies: {
          dependencyPluginVersion: {
            user: true,
            organization: true,
          }
        },
      },
    });
  }

  public async getByIds(ids: string[]): Promise<PluginVersion[]> {
    return await this.queryRunner.manager.find(PluginVersion, {
      where: { id: In(ids) },
      relations: {
        user: true,
        organization: true,
        dependencies: {
          dependencyPluginVersion: {
            user: true,
            organization: true,
          }
        },
      },
    });
  }

  public async updatePluginVersion(
    pluginVersion: PluginVersion,
    pluginVersionArgs: DeepPartial<PluginVersion>
  ): Promise<PluginVersion> {
    return (
      (await this.updatePluginVersionById(
        pluginVersion.id,
        pluginVersionArgs
      )) ?? pluginVersion
    );
  }

  public async updatePluginVersionById(
    id: string,
    pluginVersionArgs: DeepPartial<PluginVersion>
  ): Promise<PluginVersion | null> {
    const pluginVersion = await this.getById(id);
    if (pluginVersion === null) {
      throw new Error("Invalid ID to update for PluginVersion.id: " + id);
    }
    for (const prop in pluginVersionArgs) {
      pluginVersion[prop] = pluginVersionArgs[prop];
    }
    return await this.queryRunner.manager.save(PluginVersion, pluginVersion);
  }
}