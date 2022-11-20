import { DeepPartial, MoreThan, LessThan, QueryRunner, Repository } from "typeorm";
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

  public async getById(id: string): Promise<Referral | null> {
    return await this.queryRunner.manager.findOneBy(Referral, { id });
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

  public async getOpenReferralByEmailHash(
    refereeEmailHash: string
  ): Promise<Referral | null> {
    return await this.queryRunner.manager.findOne(Referral, {
      where: {
        referralState: "sent",
        refereeEmailHash,
        expiresAt: MoreThan(new Date()),
      },
    });
  }
  public async updateReferralById(
    id: string,
    referralArgs: DeepPartial<Referral>
  ): Promise<Referral | null> {
    const user = await this.getById(id);
    if (user === null) {
      throw new Error("Invalid ID to update for User.id: " + id);
    }
    for (const prop in referralArgs) {
      user[prop] = referralArgs[prop];
    }
    return await this.queryRunner.manager.save(Referral, user);
  }
}
