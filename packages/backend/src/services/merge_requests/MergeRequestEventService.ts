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
export default class MergeRequestEventService implements BranchPushHandler {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async onBranchChanged(queryRunner: QueryRunner, byUser: User, branch: Branch): Promise<void> {
    // see if MR is open
  }
}