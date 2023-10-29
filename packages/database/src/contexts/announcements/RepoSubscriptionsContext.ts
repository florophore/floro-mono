import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { RepoSubscription } from "../../entities/RepoSubscription";
import { Repository as DBRepository } from "../../entities/Repository";

export default class RepoSubscriptionsContext extends BaseContext {
  private repoSubscriptionRepo!: Repository<RepoSubscription>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoSubscriptionRepo = this.conn.datasource.getRepository(RepoSubscription);
  }

  public async create(args: DeepPartial<RepoSubscription>): Promise<RepoSubscription> {
    const entity = this.repoSubscriptionRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoSubscription | null> {
    return await this.queryRunner.manager.findOneBy(RepoSubscription, { id });
  }

  public async getByUserIdAndRepoId(
    userId: string,
    repositoryId: string
  ): Promise<RepoSubscription | null> {
    return await this.queryRunner.manager.findOneBy(RepoSubscription, {
      userId,
      repositoryId,
    });
  }

  public async deleteSubscription(
    userId: string,
    repositoryId: string
  ): Promise<void> {
    await this.queryRunner.manager.delete(RepoSubscription, {
      userId,
      repositoryId,
    });
  }

  public async getSubscribedRepositoriesForUser(
    userId: string,
  ): Promise<DBRepository[]> {
    const subscriptions = await this.queryRunner.manager.find(
      RepoSubscription,
      {
        where: {
          userId,
        },
        relations: {
          repository: true,
        },
      }
    );
    return subscriptions.map(
      (subscription) => subscription.repository as DBRepository
    );
  }
}
