import { DeepPartial, QueryRunner, Repository } from "typeorm";
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
}
