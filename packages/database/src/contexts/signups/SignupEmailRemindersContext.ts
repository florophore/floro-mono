import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { SignupEmailReminder } from "../../entities/SignupEmailReminder";

export default class SignupEmailRemindersContext extends BaseContext {

    private signupEmailReminderRepo!: Repository<SignupEmailReminder>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.signupEmailReminderRepo = this.conn.datasource.getRepository(SignupEmailReminder);
    }

    public async createReminderRecord(signupEmailReminderArgs: DeepPartial<SignupEmailReminder>): Promise<SignupEmailReminder> {
        const entity = this.signupEmailReminderRepo.create(signupEmailReminderArgs);
        return await this.queryRunner.manager.save(entity);
    }

    public async getByEmail(email: string): Promise<SignupEmailReminder|null> {
        return await this.queryRunner.manager.findOneBy(SignupEmailReminder, {email});
    }
}