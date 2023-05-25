import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Binary } from "../../entities/Binary";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class BinariesContext extends BaseContext {

    private binaryRepo!: Repository<Binary>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.binaryRepo = this.conn.datasource.getRepository(Binary);
    }

    public async create(binaryArgs: DeepPartial<Binary>): Promise<Binary> {
        const binaryEntity = this.binaryRepo.create(binaryArgs);
        return await this.queryRunner.manager.save(binaryEntity);
    }

    public async getById(id: string): Promise<Binary|null> {
        return await this.queryRunner.manager.findOneBy(Binary, {id});
    }
}