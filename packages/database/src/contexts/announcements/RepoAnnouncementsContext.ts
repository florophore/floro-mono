
import { DeepPartial, In, QueryRunner, Repository } from "typeorm";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { RepoAnnouncement } from "../../entities/RepoAnnouncement";
import { RepoAnnouncementReply } from "../../entities/RepoAnnouncementReply";

export default class RepoAnnouncementsContext extends BaseContext {
  private repoAnnouncementRepo!: Repository<RepoAnnouncement>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.repoAnnouncementRepo =
      this.conn.datasource.getRepository(RepoAnnouncement);
  }

  public async create(
    args: DeepPartial<RepoAnnouncement>
  ): Promise<RepoAnnouncement> {
    const entity = this.repoAnnouncementRepo.create(args);
    return await this.queryRunner.manager.save(entity);
  }

  public async getById(id: string): Promise<RepoAnnouncement | null> {
    return await this.queryRunner.manager.findOneBy(RepoAnnouncement, { id });
  }

  public async getByIdWithRelations(
    id: string
  ): Promise<RepoAnnouncement | null> {
    const announcement = await this.queryRunner.manager.findOne(RepoAnnouncement, {
      where: {
        id,
      },
      relations: {
        repository: true,
        user: {
          profilePhoto: true,
        },
        organization: {
          profilePhoto: true,
        },
        replies: {
          user: {
            profilePhoto: true,
          },
        },
      },
    });
    if (!announcement) {
      return null;
    }
    return {
      ...announcement,
      replies: (announcement?.replies?.filter((r) => !r.isDeleted) ?? []).sort(
        (a, b) => (new Date(a.createdAt) >= new Date(b.createdAt) ? 1 : -1)
      ) as Array<RepoAnnouncementReply>,
    } as RepoAnnouncement;
  }

  public async updateRepoAnnouncement(
    repoAnnouncement: RepoAnnouncement,
    repoAnnouncementArgs: DeepPartial<RepoAnnouncement>
  ): Promise<RepoAnnouncement> {
    return (
      (await this.updateRepoAnnouncementById(
        repoAnnouncement.id,
        repoAnnouncementArgs
      )) ?? repoAnnouncement
    );
  }

  public async updateRepoAnnouncementById(
    id: string,
    repoAnnouncementArgs: DeepPartial<RepoAnnouncement>
  ): Promise<RepoAnnouncement | null> {
    const repoAnnouncement = await this.getById(id);
    if (repoAnnouncement === null) {
      throw new Error("Invalid ID to update for RepoAnnouncement.id: " + id);
    }
    for (const prop in repoAnnouncementArgs) {
      repoAnnouncement[prop] = repoAnnouncementArgs[prop];
    }
    return await this.queryRunner.manager.save(
      RepoAnnouncement,
      repoAnnouncement
    );
  }

  public async getRepoAnnouncementsForRepository(
    repositoryId: string
  ): Promise<Array<RepoAnnouncement>> {
    const announcements = await this.queryRunner.manager.find(
      RepoAnnouncement,
      {
        where: {
          repositoryId,
          isDeleted: false,
        },
        order: {
          createdAt: "DESC",
          replies: {
            createdAt: "ASC",
          },
        },
        relations: {
          repository: true,
          user: {
            profilePhoto: true,
          },
          organization: {
            profilePhoto: true,
          },
          replies: {
            user: {
              profilePhoto: true,
            },
          },
        },
      }
    );
    return (
      (announcements?.map?.((a) => {
        return {
          ...a,
          replies: (a?.replies?.filter((r) => !r.isDeleted) ?? []).sort((a, b) => new Date(a.createdAt) >= new Date(b.createdAt) ? 1 : -1),
        };
      }) as Array<RepoAnnouncement>) ?? []
    ).sort((a, b) => new Date(a.createdAt) >= new Date(b.createdAt) ? -1 : 1);
  }

  public async getRepoAnnouncementsForRepositories(
    repositoryIds: Array<string>
  ): Promise<Array<RepoAnnouncement>> {
    const announcements = await this.queryRunner.manager.find(
      RepoAnnouncement,
      {
        where: {
          repositoryId: In(repositoryIds),
          isDeleted: false,
        },
        order: {
          createdAt: "DESC",
          replies: {
            createdAt: "ASC",
          },
        },
        relations: {
          repository: true,
          user: {
            profilePhoto: true,
          },
          organization: {
            profilePhoto: true,
          },
          replies: {
            user: {
              profilePhoto: true,
            },
          },
        },
      }
    );
    return (
      (announcements?.map?.((a) => {
        return {
          ...a,
          replies: (a?.replies?.filter((r) => !r.isDeleted) ?? []).sort((a, b) => new Date(a.createdAt) >= new Date(b.createdAt) ? 1 : -1),
        };
      }) as Array<RepoAnnouncement>) ?? []
    ).sort((a, b) => new Date(a.createdAt) >= new Date(b.createdAt) ? -1 : 1);
  }
}