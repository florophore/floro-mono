import { injectable, inject } from "inversify";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAnnouncementsContext from "@floro/database/src/contexts/announcements/RepoAnnouncementsContext";
import RepoAnnouncementRepliesContext from "@floro/database/src/contexts/announcements/RepoAnnouncementRepliesContext";
import RepoBookmarksContext from "@floro/database/src/contexts/announcements/RepoBookmarksContext";
import RepoSubscriptionsContext from "@floro/database/src/contexts/announcements/RepoSubscriptionsContext";
import { User } from "@floro/database/src/entities/User";
import { RepoAnnouncement } from "@floro/database/src/entities/RepoAnnouncement";
import RepoDataService from "../repositories/RepoDataService";
import { RepoAnnouncementReply } from "@floro/database/src/entities/RepoAnnouncementReply";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";

export interface CreateRepoAnnouncementResponse {
  action:
    | "REPO_ANNOUNCEMENT_CREATED"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateRepoAnnouncementResponse {
  action:
    | "REPO_ANNOUNCEMENT_UPDATED"
    | "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface DeleteRepoAnnouncementResponse {
  action:
    | "REPO_ANNOUNCEMENT_DELETED"
    | "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}


export interface CreateRepoAnnouncementReplyResponse {
  action:
    | "REPO_ANNOUNCEMENT_REPLY_CREATED"
    | "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  repoAnnouncementReply?: RepoAnnouncementReply;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateRepoAnnouncementReplyResponse {
  action:
    | "REPO_ANNOUNCEMENT_REPLY_UPDATED"
    | "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR"
    | "REPO_ANNOUNCEMENT_REPLY_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  repoAnnouncementReply?: RepoAnnouncementReply;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface DeleteRepoAnnouncementReplyResponse {
  action:
    | "REPO_ANNOUNCEMENT_REPLY_DELETED"
    | "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR"
    | "REPO_ANNOUNCEMENT_REPLY_DOES_NOT_EXIST_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_USER_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "LOG_ERROR";
  repoAnnouncement?: RepoAnnouncement;
  repoAnnouncementReply?: RepoAnnouncementReply;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}
const PAGINATION_SIZE = 12;

@injectable()
export default class RepoAnnouncementService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
  }

  public async getBookmarkedRepos(user: User, currentUser?: User|null) {
    const reposUserHasPermissionToRead: Array<Repository> = [];
    const repoBookmarksContext = await this.contextFactory.createContext(
      RepoBookmarksContext
    );
    const bookmarkedRepos =
      await repoBookmarksContext.getBookmarkedRepositoriesForUser(
        user.id
      );
    for (const repo of bookmarkedRepos) {
      const remoteSettings =
        await this.repoDataService.fetchRepoSettingsForUser(
          repo.id,
          currentUser
        );
      if (remoteSettings?.canReadRepo) {
        reposUserHasPermissionToRead.push(repo);
      }
    }
    return reposUserHasPermissionToRead;
  }

  public async fetchFeed(
    currentUser: User,
    lastId: string
  ): Promise<{
    announcements: Array<RepoAnnouncement>;
    lastId: string | null;
    hasMore: boolean;
  }> {
    if (!currentUser) {
      return this.paginateFeed([], lastId);
    }
    const repoSubscriptionsContext = await this.contextFactory.createContext(
      RepoSubscriptionsContext
    );
    const reposContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const subscribedRepos =
      await repoSubscriptionsContext.getSubscribedRepositoriesForUser(
        currentUser.id
      );
    const userRepos =
      await reposContext.getUserRepos(
        currentUser.id
      );

    const userRepoIds = userRepos.map(r => r.id);
    const reposUserHasPermissionToRead: Array<Repository> = [];

    for (const repo of subscribedRepos) {
      const remoteSettings =
        await this.repoDataService.fetchRepoSettingsForUser(
          repo.id,
          currentUser
        );
      if (remoteSettings?.canReadRepo) {
        reposUserHasPermissionToRead.push(repo);
      }
    }
    const repoAnnouncementsContext = await this.contextFactory.createContext(
      RepoAnnouncementsContext
    );
    const repoIds = reposUserHasPermissionToRead.map((r) => r.id);
    for (const repoId of userRepoIds) {
      if (!repoIds.includes(repoId)) {
        repoIds.push(repoId);
      }
    }
    const repoAnnouncemnts =
      await repoAnnouncementsContext.getRepoAnnouncementsForRepositories(
        repoIds
      );
    return this.paginateFeed(repoAnnouncemnts, lastId);
  }

  public async fetchRepoAnnouncementsForRepo(
    repositoryId: string,
    currentUser: User | null,
    lastId: string
  ) {
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repo = await repositoriesContext.getById(repositoryId);
    if (!repo) {
      return this.paginateFeed([], lastId);
    }

    const remoteSettings = await this.repoDataService.fetchRepoSettingsForUser(
      repo.id,
      currentUser
    );
    if (!remoteSettings?.canReadRepo) {
      return this.paginateFeed([], lastId);
    }
    const repoAnnouncementsContext = await this.contextFactory.createContext(
      RepoAnnouncementsContext
    );
    const repoAnnouncemnts =
      await repoAnnouncementsContext.getRepoAnnouncementsForRepository(repo.id);
    return this.paginateFeed(repoAnnouncemnts, lastId);
  }

  public async fetchRepoAnnouncementsForUser(
    userId: string,
    currentUser: User | null,
    lastId: string
  ) {
    const reposUserHasPermissionToRead: Array<Repository> = [];
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const userRepos = await repositoriesContext.getUserRepos(userId);

    for (const repo of userRepos) {
      const remoteSettings =
        await this.repoDataService.fetchRepoSettingsForUser(
          repo.id,
          currentUser
        );
      if (remoteSettings?.canReadRepo) {
        reposUserHasPermissionToRead.push(repo);
      }
    }
    const repoAnnouncementsContext = await this.contextFactory.createContext(
      RepoAnnouncementsContext
    );
    const repoIds = reposUserHasPermissionToRead.map((r) => r.id);
    const repoAnnouncemnts =
      await repoAnnouncementsContext.getRepoAnnouncementsForRepositories(
        repoIds
      );
    return this.paginateFeed(repoAnnouncemnts, lastId);
  }

  public async fetchRepoAnnouncementsForOrg(
    organizationId: string,
    currentUser: User | null,
    lastId: string
  ) {
    const reposUserHasPermissionToRead: Array<Repository> = [];
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const orgRepos = await repositoriesContext.getOrgRepos(organizationId);

    for (const repo of orgRepos) {
      const remoteSettings =
        await this.repoDataService.fetchRepoSettingsForUser(
          repo.id,
          currentUser
        );
      if (remoteSettings?.canReadRepo) {
        reposUserHasPermissionToRead.push(repo);
      }
    }
    const repoAnnouncementsContext = await this.contextFactory.createContext(
      RepoAnnouncementsContext
    );
    const repoIds = reposUserHasPermissionToRead.map((r) => r.id);
    const repoAnnouncemnts =
      await repoAnnouncementsContext.getRepoAnnouncementsForRepositories(
        repoIds
      );
    return this.paginateFeed(repoAnnouncemnts, lastId);
  }

  private paginateFeed(
    repoAnnouncements: RepoAnnouncement[],
    lastId?: string | null
  ): {
    announcements: Array<RepoAnnouncement>;
    lastId: string | null;
    hasMore: boolean;
  } {
    if (!lastId) {
      const out = repoAnnouncements.slice(0, PAGINATION_SIZE);
      const lastId = out?.[out.length - 1]?.id ?? null;
      const hasMore = out.length < repoAnnouncements.length;
      return {
        announcements: out,
        lastId,
        hasMore,
      };
    }
    const out: Array<RepoAnnouncement> = [];
    let i: number = 0;
    for (; i < repoAnnouncements.length; ++i) {
      if (repoAnnouncements[i]?.id == lastId) {
        for (
          let j = i + 1;
          j < Math.min(i + 1 + PAGINATION_SIZE, repoAnnouncements.length);
          ++j
        ) {
          out.push(repoAnnouncements[j] as RepoAnnouncement);
        }
        const lastId = out?.[out.length - 1]?.id ?? null;
        return {
          announcements: out,
          lastId,
          hasMore: i + 1 + PAGINATION_SIZE < repoAnnouncements.length,
        };
      }
    }
    return {
      announcements: [] as Array<RepoAnnouncement>,
      lastId: null,
      hasMore: false,
    };
  }

  public async createRepoAnnouncement(
    repository: Repository,
    user: User,
    text: string
  ): Promise<CreateRepoAnnouncementResponse> {
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      !userRepoSettings.canWriteAnnouncements
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementsContext = await this.contextFactory.createContext(
        RepoAnnouncementsContext,
        queryRunner
      );
      const repoAnnouncement = await repoAnnouncementsContext.create({
        text,
        isDeleted: false,
        createdByUserId: user.id,
        repositoryId: repository.id,
        userId: repository?.userId,
        organizationId: repository?.organizationId,
      });
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_CREATE_ANNOUNCEMENT_ERROR",
            message: "Repo missing",
          },
        };
      }
      const announcementCount = (repo?.announcementCount ?? 0) + 1;
      await repositoriesContext.updateRepo(repo, {
        announcementCount,
      });

      await queryRunner.commitTransaction();

      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          repoAnnouncement?.id as string
        );
      return {
        action: "REPO_ANNOUNCEMENT_CREATED",
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_ANNOUNCEMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateRepoAnnouncement(
    repoAnnouncement: RepoAnnouncement,
    repository: Repository,
    user: User,
    text: string
  ): Promise<UpdateRepoAnnouncementResponse> {
    if (repoAnnouncement.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      !userRepoSettings.canWriteAnnouncements ||
      repository?.id != repoAnnouncement.repositoryId
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementsContext = await this.contextFactory.createContext(
        RepoAnnouncementsContext,
        queryRunner
      );
      const textUpdatedRepoAnnouncement =
        await repoAnnouncementsContext.updateRepoAnnouncementById(
          repoAnnouncement.id,
          {
            text,
          }
        );

      await queryRunner.commitTransaction();

      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          textUpdatedRepoAnnouncement?.id as string
        );
      return {
        action: "REPO_ANNOUNCEMENT_UPDATED",
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_ANNOUNCEMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async deleteRepoAnnouncement(
    repoAnnouncement: RepoAnnouncement,
    repository: Repository,
    user: User
  ): Promise<DeleteRepoAnnouncementResponse> {
    if (repoAnnouncement.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      !userRepoSettings.canWriteAnnouncements ||
      repository?.id != repoAnnouncement.repositoryId
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementsContext = await this.contextFactory.createContext(
        RepoAnnouncementsContext,
        queryRunner
      );
      const deletedRepoAnnouncement =
        await repoAnnouncementsContext.updateRepoAnnouncementById(
          repoAnnouncement.id,
          {
            isDeleted: true,
          }
        );

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo || !deletedRepoAnnouncement) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_CREATE_ANNOUNCEMENT_ERROR",
            message: "Repo missing",
          },
        };
      }
      const announcementCount = Math.max(0, (repo?.announcementCount ?? 0) - 1);
      await repositoriesContext.updateRepo(repo, {
        announcementCount,
      });

      await queryRunner.commitTransaction();

      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          deletedRepoAnnouncement?.id as string
      );
      return {
        action: "REPO_ANNOUNCEMENT_DELETED",
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DELETE_ANNOUNCEMENT_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async createRepoAnnouncementReply(
    repoAnnouncement: RepoAnnouncement,
    repository: Repository,
    user: User,
    text: string
  ): Promise<CreateRepoAnnouncementReplyResponse> {
    if (repoAnnouncement.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      // ERROR
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      repoAnnouncement.repositoryId != repository.id
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementRepliesContext =
        await this.contextFactory.createContext(
          RepoAnnouncementRepliesContext,
          queryRunner
        );
      const repoAnnouncementReply = await repoAnnouncementRepliesContext.create(
        {
          text,
          isDeleted: false,
          repoAnnouncementId: repoAnnouncement?.id,
          userId: user?.id,
        }
      );

      await queryRunner.commitTransaction();
      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          repoAnnouncement.id
        );
      return {
        action: "REPO_ANNOUNCEMENT_REPLY_CREATED",
        repoAnnouncementReply,
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      console.log("E", e);
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_ANNOUNCEMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateRepoAnnouncementReply(
    repoAnnouncementReply: RepoAnnouncementReply,
    repoAnnouncement: RepoAnnouncement,
    repository: Repository,
    user: User,
    text: string
  ): Promise<UpdateRepoAnnouncementReplyResponse> {
    if (repoAnnouncementReply.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if (repoAnnouncement.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if ((text ?? "")?.trim() == "") {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing text",
        },
      };
    }

    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      repoAnnouncement.repositoryId != repository.id ||
      repoAnnouncementReply.repoAnnouncementId != repoAnnouncement.id ||
      repoAnnouncementReply.userId != user.id
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementRepliesContext =
        await this.contextFactory.createContext(
          RepoAnnouncementRepliesContext,
          queryRunner
        );
      const updatedRepoAnnouncementReply =
        await repoAnnouncementRepliesContext.updateRepoAnnouncementReply(
          repoAnnouncementReply,
          {
            text,
          }
        );

      await queryRunner.commitTransaction();
      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          repoAnnouncement.id
        );
      return {
        action: "REPO_ANNOUNCEMENT_REPLY_UPDATED",
        repoAnnouncementReply: updatedRepoAnnouncementReply,
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_ANNOUNCEMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async deleteRepoAnnouncementReply(
    repoAnnouncementReply: RepoAnnouncementReply,
    repoAnnouncement: RepoAnnouncement,
    repository: Repository,
    user: User
  ): Promise<DeleteRepoAnnouncementReplyResponse> {
    if (repoAnnouncementReply.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    if (repoAnnouncement.isDeleted) {
      return {
        action: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
        error: {
          type: "REPO_ANNOUNCEMENT_DOES_NOT_EXIST_ERROR",
          message: "Comment does not exist",
        },
      };
    }
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);

    if (
      !userRepoSettings?.canReadRepo ||
      repoAnnouncement.repositoryId != repository.id ||
      repoAnnouncementReply.repoAnnouncementId != repoAnnouncement.id ||
      repoAnnouncementReply.userId != user.id
    ) {
      return {
        action: "INVALID_USER_ERROR",
        error: {
          type: "INVALID_USER_ERROR",
          message: "Invalid commenter",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoAnnouncementRepliesContext =
        await this.contextFactory.createContext(
          RepoAnnouncementRepliesContext,
          queryRunner
        );
      const updatedRepoAnnouncementReply =
        await repoAnnouncementRepliesContext.updateRepoAnnouncementReply(
          repoAnnouncementReply,
          {
            isDeleted: true,
          }
        );

      await queryRunner.commitTransaction();
      const updateRepoAnnouncementsContext =
        await this.contextFactory.createContext(RepoAnnouncementsContext);
      const updatedRepoAnnouncement =
        await updateRepoAnnouncementsContext.getByIdWithRelations(
          repoAnnouncement.id
        );
      return {
        action: "REPO_ANNOUNCEMENT_REPLY_DELETED",
        repoAnnouncementReply: updatedRepoAnnouncementReply,
        repoAnnouncement: updatedRepoAnnouncement as RepoAnnouncement,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DELETED_ANNOUNCEMENT_REPLY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async bookmarkRepo(
    repository: Repository,
    user: User
  ): Promise<boolean> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    if (!userRepoSettings?.canReadRepo) {
      return false;
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoBookmarksContext = await this.contextFactory.createContext(
        RepoBookmarksContext,
        queryRunner
      );
      const existingBookmark = await repoBookmarksContext.getByUserIdAndRepoId(
        user.id,
        repository.id
      );
      if (existingBookmark) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      await repoBookmarksContext.create({
        userId: user.id,
        repositoryId: repository.id,
      });
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      const bookmarkCount = (repo?.bookmarkCount ?? 0) + 1;
      await repositoriesContext.updateRepo(repo, {
        bookmarkCount,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return false;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async unBookmarkRepo(
    repository: Repository,
    user: User
  ): Promise<boolean> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    if (!userRepoSettings?.canReadRepo) {
      return false;
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoBookmarksContext = await this.contextFactory.createContext(
        RepoBookmarksContext,
        queryRunner
      );
      const existingBookmark = await repoBookmarksContext.getByUserIdAndRepoId(
        user.id,
        repository.id
      );
      if (!existingBookmark) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      await repoBookmarksContext.deleteBookmark(user.id, repository.id);
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      const bookmarkCount = Math.max(0, (repo?.bookmarkCount ?? 0) - 1);
      await repositoriesContext.updateRepo(repo, {
        bookmarkCount,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return false;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async subscribeToRepo(
    repository: Repository,
    user: User
  ): Promise<boolean> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    if (!userRepoSettings?.canReadRepo) {
      return false;
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoSubscriptionsContext = await this.contextFactory.createContext(
        RepoSubscriptionsContext,
        queryRunner
      );
      const existingSubscription =
        await repoSubscriptionsContext.getByUserIdAndRepoId(
          user.id,
          repository.id
        );
      if (existingSubscription) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      await repoSubscriptionsContext.create({
        userId: user.id,
        repositoryId: repository.id,
      });
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      const subscriptionCount = (repo?.subscriptionCount ?? 0) + 1;
      await repositoriesContext.updateRepo(repo, {
        subscriptionCount,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return false;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async unsubscribeFromRepo(
    repository: Repository,
    user: User
  ): Promise<boolean> {
    const userRepoSettings =
      await this.repoDataService.fetchRepoSettingsForUser(repository.id, user);
    if (!userRepoSettings?.canReadRepo) {
      return false;
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      // START TRANSACTION
      await queryRunner.startTransaction();
      const repoSubscriptionsContext = await this.contextFactory.createContext(
        RepoSubscriptionsContext,
        queryRunner
      );
      const existingSubscription =
        await repoSubscriptionsContext.getByUserIdAndRepoId(
          user.id,
          repository.id
        );
      if (!existingSubscription) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      await repoSubscriptionsContext.deleteSubscription(user.id, repository.id);
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repository.id);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return false;
      }
      const subscriptionCount = Math.max(0, (repo?.subscriptionCount ?? 0) - 1);
      await repositoriesContext.updateRepo(repo, {
        subscriptionCount,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return false;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
