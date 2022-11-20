import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Referral } from "../../entities/Referral";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class ReferralsContext extends BaseContext {
  private referralsRepo!: Repository<Referral>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.referralsRepo = this.conn.datasource.getRepository(Referral);
  }

  public async createReferral(
    referralsArgs: DeepPartial<Referral>
  ): Promise<Referral> {
    const userServiceAgreementEntity = this.referralsRepo.create(referralsArgs);
    return await this.queryRunner.manager.save(userServiceAgreementEntity);
  }

  public async getByRefereeId(refereeUserId: string): Promise<Referral | null> {
    return await this.queryRunner.manager.findOneBy(Referral, {
      refereeUserId,
    });
  }

  public async getByReferrerId(
    referrerUserId: string
  ): Promise<Referral | null> {
    return await this.queryRunner.manager.findOneBy(Referral, {
      referrerUserId,
    });
  }
}
