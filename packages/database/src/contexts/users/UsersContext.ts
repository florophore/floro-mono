import { DeepPartial, QueryRunner, Raw, Repository } from "typeorm";
import { User } from "../../entities/User";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class UsersContext extends BaseContext {

    private userRepo!: Repository<User>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.userRepo = this.conn.datasource.getRepository(User);
    }

    public async createUser(userArgs: DeepPartial<User>): Promise<User> {
        const userEntity = this.userRepo.create(userArgs);
        return await this.queryRunner.manager.save(userEntity);
    }

    public async getById(id: string): Promise<User|null> {
        return await this.queryRunner.manager.findOneBy(User, {id});
    }

    public async usernameExists(username: string): Promise<boolean> {
        const qb = await this.userRepo.createQueryBuilder('user', this.queryRunner);
        const count = await qb.where('LOWER(user.username) = :username').setParameter('username', username.toLowerCase()).getCount();
        return count > 0;
    }

    public async updateUser(user: User, userArgs: DeepPartial<User>): Promise<User> {
        return await this.updateUserById(user.id, userArgs) ?? user;
    }

    public async updateUserById(id: string, userArgs: DeepPartial<User>): Promise<User|null> {
        const user = await this.getById(id)
        if (user === null) {
            throw new Error('Invalid ID to update for User.id: ' + id);
        }
        for(const prop in userArgs) {
            user[prop] = userArgs[prop];
        }
        return await this.queryRunner.manager.save(User, user);
    }
}