import { DeepPartial, In, QueryRunner, Repository } from "typeorm";
import { RepoEnabledRoleSetting } from "../../entities/RepoEnabledRoleSetting";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class RepositoryEnabledRoleSettingsContext extends BaseContext {
  private repoEnabledRoleSettingRepo!: Repository<RepoEnabledRoleSetting>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoEnabledRoleSettingRepo = this.conn.datasource.getRepository(
      RepoEnabledRoleSetting
    );
  }

  public async create(
    args: DeepPartial<RepoEnabledRoleSetting>
  ): Promise<RepoEnabledRoleSetting> {
    const entity = this.repoEnabledRoleSettingRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoEnabledRoleSetting | null> {
    return await this.queryRunner.manager.findOneBy(RepoEnabledRoleSetting, {
      id,
    });
  }

  public async hasRepoRoleIds(repositoryId: string, roleIds: string[], settingName: string): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(RepoEnabledRoleSetting, {
        where: {
            repositoryId,
            roleId: In(roleIds),
            settingName
        }
    });
    return count > 0;
  }
}
