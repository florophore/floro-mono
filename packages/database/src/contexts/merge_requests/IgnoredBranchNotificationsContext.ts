
import { DeepPartial, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { IgnoredBranchNotification } from "../../entities/IgnoredBranchNotification";

export default class IgnoredBranchNotificationsContext extends BaseContext {
  private ignoredBranchNotificationsRepo!: Repository<IgnoredBranchNotification>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.ignoredBranchNotificationsRepo = this.conn.datasource.getRepository(IgnoredBranchNotification);
  }

  public async create(args: DeepPartial<IgnoredBranchNotification>): Promise<IgnoredBranchNotification> {
    const entity = this.ignoredBranchNotificationsRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<IgnoredBranchNotification | null> {
    return await this.queryRunner.manager.findOneBy(IgnoredBranchNotification, { id });
  }

  public async getIgnoredBranch(repositoryId: string, userId: string, branchId: string): Promise<IgnoredBranchNotification | null> {
    return await this.queryRunner.manager.findOneBy(IgnoredBranchNotification, {
      repositoryId,
      branchId,
      userId,
      isDeleted: false,
    });
  }

  public async getIgnoredBranches(repositoryId: string, userId: string, branchId: string): Promise<IgnoredBranchNotification[]> {
    return await this.queryRunner.manager.find(IgnoredBranchNotification, {
      where: {
        repositoryId,
        userId,
        branchId,
        isDeleted: false,
      },
    });
  }

  public async hasIgnoredBranchNotification(
    repositoryId: string, userId: string, branchId: string
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCount(
      IgnoredBranchNotification,
      {
        where: {
          repositoryId,
          userId,
          branchId,
          isDeleted: false,
        },
      }
    );
    return count > 0;
  }
  public async updateIgnoredBranchNotification(
    ignoredBranchNotification: IgnoredBranchNotification,
    ignoredBranchNotificationArgs: DeepPartial<IgnoredBranchNotification>
  ): Promise<IgnoredBranchNotification> {
    return (
      (await this.updateIgnoredBranchNotificationById(
        ignoredBranchNotification.id,
        ignoredBranchNotificationArgs
      )) ?? ignoredBranchNotification
    );
  }

  public async updateIgnoredBranchNotificationById(
    id: string,
    ignoredBranchNotificationArgs: DeepPartial<IgnoredBranchNotification>
  ): Promise<IgnoredBranchNotification | null> {
    const ignoredBranchNotification = await this.getById(id);
    if (ignoredBranchNotification === null) {
      throw new Error("Invalid ID to update for IgnoredBranchNotification.id: " + id);
    }
    for (const prop in ignoredBranchNotificationArgs) {
      ignoredBranchNotification[prop] = ignoredBranchNotification[prop];
    }
    return await this.queryRunner.manager.save(IgnoredBranchNotification, ignoredBranchNotification);
  }
}