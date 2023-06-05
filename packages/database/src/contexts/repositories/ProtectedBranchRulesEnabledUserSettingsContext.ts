import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { ProtectedBranchRuleEnabledUserSetting } from "../../entities/ProtectedBranchRuleEnabledUserSetting";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class ProtectedBranchRulesEnabledUserSettingsContext extends BaseContext {
  private protectedBranchRuleEnabledUserSettingRepo!: Repository<ProtectedBranchRuleEnabledUserSetting>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.protectedBranchRuleEnabledUserSettingRepo =
      this.conn.datasource.getRepository(ProtectedBranchRuleEnabledUserSetting);
  }

  public async create(
    args: DeepPartial<ProtectedBranchRuleEnabledUserSetting>
  ): Promise<ProtectedBranchRuleEnabledUserSetting> {
    const entity = this.protectedBranchRuleEnabledUserSettingRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(
    id: string
  ): Promise<ProtectedBranchRuleEnabledUserSetting | null> {
    return await this.queryRunner.manager.findOneBy(
      ProtectedBranchRuleEnabledUserSetting,
      { id }
    );
  }

  public async hasUserId(protectedBranchRuleId: string, userId: string, settingName: string): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(ProtectedBranchRuleEnabledUserSetting, {
        where: {
            protectedBranchRuleId,
            userId,
            settingName
        }
    });
    return count > 0;
  }
}
