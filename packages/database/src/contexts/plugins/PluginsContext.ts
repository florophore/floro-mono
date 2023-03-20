import { DeepPartial, In, IsNull, Not, QueryRunner, Repository as TypeormRepository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { Plugin } from "../../entities/Plugin";
import { Repository } from "../../entities/Repository";
import PluginHelper from "../utils/PluginHelper";

const READ_RELATIONS = {
  user: true,
  organization: true,
  createdByUser: true,
  versions: {
    dependencies: {
      dependencyPluginVersion: {
        user: true,
        organization: true,
      }
    },
  },
  lastReleasedPrivatePluginVersion: {
    dependencies: {
      dependencyPluginVersion: {
        user: true,
        organization: true,
      }
    },
  },
  lastReleasedPublicPluginVersion: {
    dependencies: {
      dependencyPluginVersion: {
        user: true,
        organization: true,
      }
    },
  },
};

export default class PluginsContext extends BaseContext {
  private pluginRepo!: TypeormRepository<Plugin>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.pluginRepo = this.conn.datasource.getRepository(Plugin);
  }

  public async createPlugin(
    pluginArgs: DeepPartial<Plugin>
  ): Promise<Plugin> {
    const pluginEntity = this.pluginRepo.create(pluginArgs);
    return await this.queryRunner.manager.save(pluginEntity);
  }

  public async getById(id: string): Promise<Plugin | null> {
    return await this.queryRunner.manager.findOne(Plugin, {
      where: { id },
      relations: READ_RELATIONS
    });
  }

  public async getByIds(ids: string[]): Promise<Array<Plugin>> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { id: In(ids) },
      relations: READ_RELATIONS
    });
  }

  public async pluginExistsByNameKey(nameKey: string): Promise<boolean> {
    const result = await this.queryRunner.manager.findOne(Plugin, {
      where: { nameKey },
    });
    return !!result;
  }

  public async getByName(name?: string): Promise<Plugin | null> {
    if (!name) {
      return null;
    }
    const nameKey = PluginHelper.getPluginKeyUUID(name);
    if (!nameKey) {
      return null;
    }
    return await this.queryRunner.manager.findOne(Plugin, {
      where: { nameKey },
      relations: READ_RELATIONS
    });
  }

  public async getByNameKey(nameKey: string): Promise<Plugin | null> {
    return await this.queryRunner.manager.findOne(Plugin, {
      where: { nameKey },
      relations: READ_RELATIONS
    });
  }

  public async getUserPlugins(userId: string): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { userId },
      order: {
        name: 'ASC'
      },
      relations: READ_RELATIONS
    });
  }

  public async getUserPluginsByType(userId: string, isPrivate: boolean): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { userId, isPrivate },
      order: {
        name: 'ASC'
      },
      relations: READ_RELATIONS
    });
  }

  public async getUserPluginCountType(userId: string, isPrivate: boolean): Promise<number> {
    return await this.queryRunner.manager.countBy(Plugin, {
      userId,
      isPrivate,
    });
  }

  public async getOrgPluginCountType(organizationId: string, isPrivate: boolean): Promise<number> {
    return await this.queryRunner.manager.countBy(Plugin, {
      organizationId,
      isPrivate,
    });
  }

  public async getOrgPlugins(organizationId: string): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { organizationId },
      order: {
        name: 'ASC'
      },
      relations: READ_RELATIONS
    });
  }

  public async getOrgPluginsByType(organizationId: string, isPrivate: boolean): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { organizationId, isPrivate },
      order: {
        name: 'ASC'
      },
      relations: READ_RELATIONS
    });
  }

  public async getPublicReleasedPluginsForRepository(repository: Repository): Promise<Plugin[]> {
    if (repository.repoType == "org_repo") {
      return await this.queryRunner.manager.find(Plugin, {
        where: [
          { isPrivate: false, lastReleasedPublicPluginVersion: Not(IsNull()) },
          { isPrivate: false, lastReleasedPublicPluginVersion: IsNull(), ownerType: "org_plugin", organizationId: repository.organizationId },
        ],
        order: {
          name: 'ASC'
        },
        relations: READ_RELATIONS
      });
    }
    return await this.queryRunner.manager.find(Plugin, {
      where: [
        { isPrivate: false, lastReleasedPublicPluginVersion: Not(IsNull()) },
        { isPrivate: false, lastReleasedPublicPluginVersion: IsNull(), ownerType: "user_plugin", userId: repository.userId },
      ],
      order: {
        name: 'ASC'
      },
      relations: READ_RELATIONS
    });
  }
  public async updatePlugin(
    plugin: Plugin,
    pluginArgs: DeepPartial<Plugin>
  ): Promise<Plugin> {
    return (
      (await this.updatePluginById(
        plugin.id,
        pluginArgs
      )) ?? plugin
    );
  }

  public async updatePluginById(
    id: string,
    pluginArgs: DeepPartial<Plugin>
  ): Promise<Plugin | null> {
    const pluginVersion = await this.getById(id);
    if (pluginVersion === null) {
      throw new Error("Invalid ID to update for Plugin.id: " + id);
    }
    for (const prop in pluginArgs) {
      pluginVersion[prop] = pluginArgs[prop];
    }
    return await this.queryRunner.manager.save(Plugin, pluginVersion);
  }
}