import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { ReviewStatus } from "../../entities/ReviewStatus";

export default class ReviewerStatusesContext extends BaseContext {
  private reviewStatusRepo!: Repository<ReviewStatus>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.reviewStatusRepo = this.conn.datasource.getRepository(ReviewStatus);
  }

  public async create(args: DeepPartial<ReviewStatus>): Promise<ReviewStatus> {
    const entity = this.reviewStatusRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ReviewStatus | null> {
    return await this.queryRunner.manager.findOneBy(ReviewStatus, { id });
  }
}