import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepositoryService from "../repositories/RepositoryService";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { Branch } from "@floro/database/src/entities/Branch";
import { QueryRunner } from "typeorm";


@injectable()
export default class MergeRequestService implements BranchPushHandler {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repositoryService!: RepositoryService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepositoryService) repositoryService: RepositoryService
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repositoryService = repositoryService;
  }

  public async createMergeRequest(
    repository: Repository,
    branchId: string,
    user: User,
    title: string,
    description: string
  ) {
    /**
     * check user permissions
     * create event
     * create event
     */

  }

  public async updateMergeRequestReviewers(
    mergeRequestId: string,
    repository: Repository,
    user: User,
  ) {}

  public async updateMergeRequestInfo(
    mergeRequestId: string,
    repository: Repository,
    user: User,
  ) {}

  public async closeMergeRequest(
    mergeRequestId: User,
    repository: Repository,
    user: User,
  ) {

  }

  public async mergeMergeRequest(
    mergeRequestId: User,
    repository: Repository,
    user: User,
  ) {

  }

  public async onBranchChanged(queryRunner: QueryRunner, byUser: User, branch: Branch): Promise<void> {
    // see if MR is open
  }
}