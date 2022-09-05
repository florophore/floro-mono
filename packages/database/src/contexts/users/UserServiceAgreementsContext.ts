import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { UserServiceAgreement } from "../../entities/UserServiceAgreement";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class UserServiceAgreementsContext extends BaseContext {

    private userServiceAgreementRepo!: Repository<UserServiceAgreement>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.userServiceAgreementRepo = this.conn.datasource.getRepository(UserServiceAgreement);
    }

    public async createUserServiceAgreement(userServiceAgreementArgs: DeepPartial<UserServiceAgreement>): Promise<UserServiceAgreement> {
        const userServiceAgreementEntity = this.userServiceAgreementRepo.create(userServiceAgreementArgs);
        return await this.queryRunner.manager.save(userServiceAgreementEntity);
    }

    public async getByUserId(userId: string): Promise<UserServiceAgreement|null> {
        return await this.queryRunner.manager.findOneBy(UserServiceAgreement, {userId});
    }
}