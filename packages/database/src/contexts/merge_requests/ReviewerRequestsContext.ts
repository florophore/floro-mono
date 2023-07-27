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
    this.reviewerRequestRepo =
      this.conn.datasource.getRepository(ReviewerRequest);
  }

  public async create(
    args: DeepPartial<ReviewerRequest>
  ): Promise<ReviewerRequest> {
    const entity = this.reviewerRequestRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<ReviewerRequest | null> {
    return await this.queryRunner.manager.findOneBy(ReviewerRequest, { id });
  }

  public async getReviewerRequestsByMergeRequestId(
    mergeRequestId: string
  ): Promise<ReviewerRequest[]> {
    return await this.queryRunner.manager.find(ReviewerRequest, {
      where: {
        mergeRequestId,
        isDeleted: false,
      },
      relations: {
        requestedReviewerUser: {
          profilePhoto: true
        },
        requestedByUser: {
          profilePhoto: true
        }
      },
    });
  }

  public async updateReviewerRequest(
    reviewerRequest: ReviewerRequest,
    args: DeepPartial<ReviewerRequest>
  ): Promise<ReviewerRequest> {
    return (
      (await this.updateReviewerRequestById(reviewerRequest.id, args)) ??
      reviewerRequest
    );
  }

  public async updateReviewerRequestById(
    id: string,
    reviewerRequestArgs: DeepPartial<ReviewerRequest>
  ): Promise<ReviewerRequest | null> {
    const reviewerRequest = await this.getById(id);
    if (reviewerRequest === null) {
      throw new Error("Invalid ID to update for ReviewerRequest.id: " + id);
    }
    for (const prop in reviewerRequestArgs) {
      reviewerRequest[prop] = reviewerRequestArgs[prop];
    }
    return await this.queryRunner.manager.save(
      ReviewerRequest,
      reviewerRequest
    );
  }
}