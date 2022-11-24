import { DeepPartial, QueryRunner, Repository as TypeormRepository } from "typeorm";
import { UserServiceAgreement } from "../../entities/UserServiceAgreement";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { Repository } from "../../entities/Repository";

export default class RepositoriesContext extends BaseContext {

    private repositoryRepo!: TypeormRepository<Repository>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.repositoryRepo = this.conn.datasource.getRepository(Repository);
    }

    public async createRepo(repoArgs: DeepPartial<Repository>): Promise<Repository> {
        const repoEntity = this.repositoryRepo.create(repoArgs);
        return await this.queryRunner.manager.save(repoEntity);
    }

    public async getById(id: string): Promise<UserServiceAgreement|null> {
        return await this.queryRunner.manager.findOneBy(Repository, {id});
    }
}