import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Commit } from "../../entities/Commit";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class CommitsContext extends BaseContext {

    private commitRepo!: Repository<Commit>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.commitRepo = this.conn.datasource.getRepository(Commit);
    }

    public async create(commitArgs: DeepPartial<Commit>): Promise<Commit> {
        const commitEntity = this.commitRepo.create(commitArgs);
        return await this.queryRunner.manager.save(commitEntity);
    }

    public async getById(id: string): Promise<Commit|null> {
        return await this.queryRunner.manager.findOneBy(Commit, {id});
    }
}