import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoHelper from "@floro/database/src/contexts/utils/RepoHelper";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import {  QueryRunner } from "typeorm";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRulesEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { OrganizationRole } from "@floro/graphql-schemas/build/generated/main-graphql";

export const LICENSE_CODE_LIST = new Set([
  "apache_2",
  "gnu_general_public_3",
  "mit",
  "bsd2_simplified",
  "bsd3_new_or_revised",
  "boost",
  "creative_commons_zero_1_0",
  "eclipse_2",
  "gnu_affero_3",
  "gnu_general_2",
  "gnu_lesser_2_1",
  "mozilla_2",
  "unlicense",
]);

export interface CreateRepositoryReponse {
  action:
    | "REPO_CREATED"
    | "REPO_NAME_TAKEN_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class BranchService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoAccessor!: RepoAccessor;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
  }



  // only ever calll this during repo creation
  public async initMainBranch(queryRunner: QueryRunner, repository: Repository, currentUser: User) {

    const branchesContext = await this.contextFactory.createContext(BranchesContext, queryRunner);
    const protectedBranchRulesContext = await this.contextFactory.createContext(ProtectedBranchRulesContext, queryRunner);
    const mainBranch = await branchesContext.create({
        name: "Main",
        branchId: "main",
        createdById: currentUser.id,
        createdByUsername: currentUser.username,
        createdAt: (new Date()).toISOString(),
        organizationId: repository?.organizationId,
        repositoryId: repository?.id
    });
    const branchRule = await protectedBranchRulesContext.create({
        branchId: mainBranch.branchId,
        branchName: mainBranch.name,
        disableDirectPushing: true,
        requireApprovalToMerge: true,
        automaticallyDeleteMergedFeatureBranches: true,
        anyoneCanCreateMergeRequests: true,
        anyoneWithApprovalCanMerge: true,
        anyoneCanMergeMergeRequests: repository.isPrivate && repository.repoType == "user_repo", // by default a private repo user can do anything
        anyoneCanApproveMergeRequests: repository.isPrivate, // limit in public case
        anyoneCanRevert: repository.isPrivate, // limit in public case
        anyoneCanAutofix: repository.isPrivate, // limit in public case
        repositoryId: repository?.id,
    });

    const settingNames = [
        'anyoneCanApproveMergeRequests',
        'anyoneCanRevert',
        'anyoneCanAutofix',
    ]

    if (repository.isPrivate) {
        if (repository.repoType == "user_repo") {
            for (const settingName of settingNames) {
                const protectedBranchRulesEnabledUserSettingsContext =
                await this.contextFactory.createContext(
                    ProtectedBranchRulesEnabledUserSettingsContext,
                    queryRunner
                );
                await protectedBranchRulesEnabledUserSettingsContext.create({
                    settingName,
                    protectedBranchRuleId: branchRule.id,
                    userId: currentUser.id,
                })
            }
        }

        if (repository.repoType == "org_repo") {

            const organizationRolesContext =
                await this.contextFactory.createContext(
                OrganizationRolesContext,
                queryRunner
                );
            const adminRole =
              await organizationRolesContext.getRoleForOrgByPresetName(
                repository.organizationId,
                "admin"
              );
            for (const settingName of settingNames) {
                const protectedBranchRulesEnabledRoleSettingsContext =
                await this.contextFactory.createContext(
                    ProtectedBranchRulesEnabledRoleSettingsContext,
                    queryRunner
                );
                await protectedBranchRulesEnabledRoleSettingsContext.create({
                    settingName,
                    protectedBranchRuleId: branchRule.id,
                    roleId: adminRole.id
                })
            }

        }
    }
  }
}