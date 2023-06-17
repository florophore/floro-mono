import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { ReviewerRequest } from "../../entities/ReviewerRequest";

export default class ReviewerRequestsContext extends BaseContext {
  private reviewerRequestRepo!: Repository<ReviewerRequest>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.reviewerRequestRepo = this.conn.datasource.getRepository(ReviewerRequest);
  }

  public async create(args: DeepPartial<ReviewerRequest>): Promise<ReviewerRequest> {
    const entity = this.reviewerRequestRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ReviewerRequest | null> {
    return await this.queryRunner.manager.findOneBy(ReviewerRequest, { id });
  }
}