import { DeepPartial, In, QueryRunner, Repository } from "typeorm";
import { ProtectedBranchRuleEnabledRoleSetting } from "../../entities/ProtectedBranchRuleEnabledRoleSetting";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class ProtectedBranchRuleEnabledRoleSettingsContext extends BaseContext {
  private protectedBranchRuleEnabledRoleSettingRepo!: Repository<ProtectedBranchRuleEnabledRoleSetting>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.protectedBranchRuleEnabledRoleSettingRepo =
      this.conn.datasource.getRepository(ProtectedBranchRuleEnabledRoleSetting);
  }

  public async create(
    args: DeepPartial<ProtectedBranchRuleEnabledRoleSetting>
  ): Promise<ProtectedBranchRuleEnabledRoleSetting> {
    const entity = this.protectedBranchRuleEnabledRoleSettingRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(
    id: string
  ): Promise<ProtectedBranchRuleEnabledRoleSetting | null> {
    return await this.queryRunner.manager.findOneBy(
      ProtectedBranchRuleEnabledRoleSetting,
      { id }
    );
  }

  public async hasOrgRoleIds(protectedBranchRuleId: string, roleIds: string[], settingName: string): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(ProtectedBranchRuleEnabledRoleSetting, {
        where: {
            protectedBranchRuleId,
            roleId: In(roleIds),
            settingName
        }
    });
    return count > 0;
  }

  public async getAllForBranchRuleSetting(
    protectedBranchRuleId: string,
    settingName: string
  ) {
    return await this.queryRunner.manager.find(ProtectedBranchRuleEnabledRoleSetting, {
      where: {
        protectedBranchRuleId,
        settingName,
      },
      relations: {
        role: true,
      },
      order: {
        role: {
          name: "ASC"
        },
      },
    });
  }

  public async deleteBranchRuleRoleSettings(
    protectedBranchRuleId: string,
    settingName: string
  ) {
    return await this.queryRunner.manager.delete(ProtectedBranchRuleEnabledRoleSetting, {
      protectedBranchRuleId,
      settingName,
    })
  }

  public async deleteAllForBranchRule(
    protectedBranchRuleId: string,
  ) {
    return await this.queryRunner.manager.delete(ProtectedBranchRuleEnabledRoleSetting, {
      protectedBranchRuleId,
    })
  }
}
