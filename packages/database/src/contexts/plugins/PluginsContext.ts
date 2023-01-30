
import { DeepPartial, QueryRunner, Repository as TypeormRepository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { Plugin } from "../../entities/Plugin";

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
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async pluginExistsByNameKey(nameKey: string): Promise<boolean> {
    const result = await this.queryRunner.manager.findOne(Plugin, {
      where: { nameKey },
    });
    return !!result;
  }

  public async getByNameKey(nameKey: string): Promise<Plugin | null> {
    return await this.queryRunner.manager.findOne(Plugin, {
      where: { nameKey },
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async getUserPlugins(userId: string): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { userId },
      relations: {
        user: true,
        organization: true,
      }
    });
  }

  public async getOrgPlugins(organizationId: string): Promise<Plugin[]> {
    return await this.queryRunner.manager.find(Plugin, {
      where: { organizationId },
      relations: {
        organization: true,
      }
    });
  }
}