import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Photo } from "../../entities/Photo";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class PhotosContext extends BaseContext {

    private photoRepo!: Repository<Photo>;

    public async init(queryRunner: QueryRunner, contextFactory: ContextFactory): Promise<void> {
        await super.init(queryRunner, contextFactory);
        this.photoRepo = this.conn.datasource.getRepository(Photo);
    }

    public async createPhoto(photoArgs: DeepPartial<Photo>): Promise<Photo> {
        const photoEntity = this.photoRepo.create(photoArgs);
        return await this.queryRunner.manager.save(photoEntity);
    }

    public async getById(id: string): Promise<Photo|null> {
        return await this.queryRunner.manager.findOneBy(Photo, {id});
    }
}