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
  public async getByMergeRequestIdAndUserId(mergeRequestId: string, userId: string): Promise<ReviewStatus | null> {
    return await this.queryRunner.manager.findOneBy(ReviewStatus, {
      mergeRequestId,
      userId,
      isDeleted: false,
    });
  }

  public async hasUserReviewStatusForMergeRequest(
    mergeRequestId: string,
    userId: string
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(
      ReviewStatus,
      {
        where: {
          mergeRequestId,
          userId,
          isDeleted: false,
        },
      }
    );
    return count > 0;
  }
  public async updateReviewStatus(
    reviewStatusRequest: ReviewStatus,
    args: DeepPartial<ReviewStatus>
  ): Promise<ReviewStatus> {
    return (
      (await this.updateReviewStatusById(reviewStatusRequest.id, args)) ??
      reviewStatusRequest
    );
  }

  public async updateReviewStatusById(
    id: string,
    reviewStatusArgs: DeepPartial<ReviewStatus>
  ): Promise<ReviewStatus | null> {
    const reviewStatus = await this.getById(id);
    if (reviewStatus === null) {
      throw new Error("Invalid ID to update for ReviewStatus.id: " + id);
    }
    for (const prop in reviewStatusArgs) {
      reviewStatus[prop] = reviewStatusArgs[prop];
    }
    return await this.queryRunner.manager.save(
      ReviewStatus,
      reviewStatus
    );
  }
}