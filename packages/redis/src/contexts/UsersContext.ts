import { DeepPartial, Repository } from "typeorm";
import { User } from "../entities/User";
import BaseContext from "./BaseContext";

export default class UsersContext extends BaseContext {

    private repo!: Repository<User>; 

    public async init(): Promise<void> {
        this.repo = this.conn.datasource.getRepository(User);
    }

    public async createUser(userArgs: DeepPartial<User>): Promise<User> {
        const userEntity = this.repo.create(userArgs);
        return await this.repo.save(userEntity);
    }

    public async getById(id: string): Promise<User|null> {
        return await this.repo.findOneBy({id});
    }

    public async usernameExists(username: string): Promise<boolean> {
        const [, count = 0] = await this.repo.findAndCount({
            where: {username}
        });
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
        return await this.repo.save(user);
    }
} 