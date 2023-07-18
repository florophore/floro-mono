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

  public async getById(
    id: string
  ): Promise<ProtectedBranchRule | null> {
    return await this.queryRunner.manager.findOneBy(
      ProtectedBranchRule,
      { id }
    );
  }

  public async create(
    args: DeepPartial<ProtectedBranchRule>
  ): Promise<ProtectedBranchRule> {
    const entity = this.protectedBranchRuleRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getByRepoAndBranchId(repositoryId: string, branchId: string): Promise<ProtectedBranchRule | null> {
    return await this.queryRunner.manager.findOneBy(ProtectedBranchRule, {
      repositoryId,
      branchId,
    });
  }

  public async getProtectedBranchesForRepo(repositoryId: string): Promise<ProtectedBranchRule[]> {
    return await this.queryRunner.manager.find(ProtectedBranchRule, {
      where: {
        repositoryId
      },
      order: {
        branchName: 'ASC'
      }
    });
  }
  public async updateProtectedBranchRule(
    protectedBranchRule: ProtectedBranchRule,
    protectedBranchRuleArgs: DeepPartial<ProtectedBranchRule>
  ): Promise<ProtectedBranchRule> {
    return (await this.updateProtectedBranchRuleById(protectedBranchRule.id, protectedBranchRuleArgs)) ?? protectedBranchRule;
  }

  public async updateProtectedBranchRuleById(
    id: string,
    protectedBranchRuleArgs: DeepPartial<ProtectedBranchRule>
  ): Promise<ProtectedBranchRule | null> {
    const protectedBranchRule = await this.getById(id);
    if (protectedBranchRule === null) {
      throw new Error("Invalid ID to update for ProtectedBranchRule.id: " + id);
    }
    for (const prop in protectedBranchRuleArgs) {
      protectedBranchRule[prop] = protectedBranchRuleArgs[prop];
    }
    return await this.queryRunner.manager.save(ProtectedBranchRule, protectedBranchRule);
  }

  public async deleteBranchRule(
    id: string
  ) {
    return await this.queryRunner.manager.delete(ProtectedBranchRule, {
      id,
    })
  }
}