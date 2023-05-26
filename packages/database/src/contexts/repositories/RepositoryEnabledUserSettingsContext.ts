import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { RepoEnabledUserSetting } from "../../entities/RepoEnabledUserSetting";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class ProtectedBranchRuleEnabledUserSettingsContext extends BaseContext {
  private repoEnabledUserSetggingRepo!: Repository<RepoEnabledUserSetting>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoEnabledUserSetggingRepo = this.conn.datasource.getRepository(
      RepoEnabledUserSetting
    );
  }

  public async create(
    args: DeepPartial<RepoEnabledUserSetting>
  ): Promise<RepoEnabledUserSetting> {
    const entity = this.repoEnabledUserSetggingRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoEnabledUserSetting | null> {
    return await this.queryRunner.manager.findOneBy(RepoEnabledUserSetting, {
      id,
    });
  }
}
