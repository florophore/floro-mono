import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { ProtectedBranchRule } from "../../entities/ProtectedBranchRule";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class ProtectedBranchRulesContext extends BaseContext {
  private protectedBranchRuleRepo!: Repository<ProtectedBranchRule>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.protectedBranchRuleRepo = this.conn.datasource.getRepository(
      ProtectedBranchRule
    );
  }

  public async create(
    args: DeepPartial<ProtectedBranchRule>
  ): Promise<ProtectedBranchRule> {
    const entity = this.protectedBranchRuleRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ProtectedBranchRule | null> {
    return await this.queryRunner.manager.findOneBy(ProtectedBranchRule, {
      id,
    });
  }
}