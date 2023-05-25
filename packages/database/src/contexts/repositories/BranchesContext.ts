import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Branch } from "../../entities/Branch";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class BranchesContext extends BaseContext {

    private branchRepo!: Repository<Branch>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.branchRepo = this.conn.datasource.getRepository(Branch);
    }

    public async create(branchArgs: DeepPartial<Branch>): Promise<Branch> {
        const branchEntity = this.branchRepo.create(branchArgs);
        return await this.queryRunner.manager.save(branchEntity);
    }

    public async getById(id: string): Promise<Branch|null> {
        return await this.queryRunner.manager.findOneBy(Branch, {id});
    }
}