import { injectable, inject } from "inversify";

import { QueryRunner } from "typeorm";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "@floro/database/src/entities/User";
import { Repository } from "@floro/database/src/entities/Repository";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { ProtectedBranchRule } from "@floro/database/src/entities/ProtectedBranchRule";
import ProtectedBranchRuleEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";


export interface RepoPermissions {
  canReadRepo: boolean;
  canPushBranches: boolean;
  canChangeSettings: boolean;
  canWriteAnnouncements: boolean;
}

@injectable()
export default class RepoRBACService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async userHasPermissionToPush(
    repository: Repository,
    currentUser: User,
    branchId: string | undefined,
    queryRunner?: QueryRunner
  ): Promise<boolean> {
    try {
      if (!currentUser?.id || !repository?.id) {
        return false;
      }
      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );
      if (branchId) {
        const protectedBranch =
          await protectedBranchRulesContext.getByRepoAndBranchId(
            repository.id,
            branchId
          );
        if (protectedBranch?.disableDirectPushing) {
          return false;
        }
      }
      if (!repository.isPrivate && repository.repoType == "user_repo") {
        if (currentUser.id != repository.userId) {
          return false;
        }
      }
      if (repository.isPrivate && repository.repoType == "user_repo") {
        if (currentUser.id != repository.userId) {
          return false;
        }
        return true;
      }

      const organizationsMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );
      const membership =
        repository.repoType == "org_repo"
          ? await organizationsMembersContext.getByOrgIdAndUserId(
              repository.organizationId,
              currentUser.id
            )
          : null;
      if (repository.repoType == "org_repo") {
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext,
            queryRunner
          );
        const memberRoles =
          membership?.membershipState == "active"
            ? await organizationMemberRolesContext.getRolesByMember(membership)
            : [];
        const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
        if (isAdmin) {
          return true;
        }
        if (repository?.isPrivate) {
          if (!membership || membership?.membershipState != "active") {
            return false;
          }

          if (!repository?.anyoneCanRead) {
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext,
                queryRunner
              );

            const repositoryEnabledUserSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledUserSettingsContext,
                queryRunner
              );
            const hasUserPermission =
              await repositoryEnabledUserSettingsContext.hasRepoUserId(
                repository.id,
                currentUser.id,
                "anyoneCanRead"
              );
            if (!hasUserPermission) {
              const hasRoles =
                await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                  repository.id,
                  roleIds,
                  "anyoneCanRead"
                );
              if (!hasRoles) {
                return false;
              }
            }
          }
        }

        if (!repository?.anyoneCanPushBranches) {
          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext,
              queryRunner
            );
          if (membership && membership?.membershipState == "active") {
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(membership);
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext,
                queryRunner
              );
            const hasRoles =
              await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                repository.id,
                roleIds,
                "anyoneCanPushBranches"
              );
            if (hasRoles) {
              return true;
            }
          }
        }
      }
      if (repository?.anyoneCanPushBranches && membership && membership?.membershipState == "active") {
        return true;
      }
      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext,
          queryRunner
        );
      const hasUserPermission =
        await repositoryEnabledUserSettingsContext.hasRepoUserId(
          repository.id,
          currentUser.id,
          "anyoneCanPushBranches"
        );
      if (hasUserPermission && membership?.membershipState != "active" && repository.allowExternalUsersToPush) {
        return true;
      }
      if (hasUserPermission && membership?.membershipState == "active") {
        return true;
      }
      if (repository.repoType == "user_repo") {
        if (repository.createdByUserId == currentUser.id) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  public async userHasPermissionToPullOrClone(
    repository: Repository,
    currentUser: User
  ): Promise<boolean> {
    if (!currentUser?.id || !repository?.id) {
      return false;
    }
    if (repository.isPrivate && repository.repoType == "user_repo") {
      if (currentUser.id != repository.createdByUserId) {
        return false;
      }
      return true;
    }
    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    if (repository.repoType == "org_repo") {
      const membership = await organizationsMembersContext.getByOrgIdAndUserId(
        repository.organizationId,
        currentUser.id
      );
      if (repository?.isPrivate && membership?.membershipState != "active") {
        return false;
      }
      if (repository?.isPrivate && membership?.membershipState == "active") {
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext
          );
        const memberRoles =
          await organizationMemberRolesContext.getRolesByMember(membership);
        const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
        if (isAdmin) {
          return true;
        }
        if (!repository.anyoneCanRead) {
          const roleIds = memberRoles?.map((r) => r.id);
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );

          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const hasUserPermission =
            await repositoryEnabledUserSettingsContext.hasRepoUserId(
              repository.id,
              currentUser.id,
              "anyoneCanRead"
            );
          if (!hasUserPermission) {
            const hasRoles =
              await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                repository.id,
                roleIds,
                "anyoneCanRead"
              );
            if (!hasRoles) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  public async calculateUserProtectedBranchRuleSettingPermission(
    protectedBranchRule: ProtectedBranchRule,
    repository: Repository,
    user: User | null | undefined,
    repoPermissions: RepoPermissions,
    settingName:
      | "anyoneCanCreateMergeRequests"
      | "anyoneWithApprovalCanMerge"
      | "anyoneCanMergeMergeRequests"
      | "anyoneCanApproveMergeRequests"
      | "anyoneCanRevert"
      | "anyoneCanAutofix",
      queryRunner?: QueryRunner
  ) {
    if (!user) {
      return false;
    }
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate) {
        return user.id == repository.createdByUserId;
      }
      if (user.id == repository.createdByUserId) {
        return true;
      }
      if (!repoPermissions.canPushBranches) {
        return false;
      }
      if (protectedBranchRule[settingName]) {
        return true;
      }
      const protectedBranchRuleEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledUserSettingsContext,
          queryRunner
        );
      const hasUserPermission =
        await protectedBranchRuleEnabledUserSettingsContext.hasRepoUserId(
          protectedBranchRule.id,
          user.id,
          settingName
        );
      return hasUserPermission;
    }
    // dealing with org case

    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext,
      queryRunner
    );
    const membership = await organizationsMembersContext.getByOrgIdAndUserId(
      repository.organizationId,
      user.id
    );
    if (repository.isPrivate && membership?.membershipState != "active") {
      return false;
    }

    if (protectedBranchRule[settingName]) {
      if (membership?.membershipState == "active" || repoPermissions.canPushBranches) {
        return true;
      }
    }

    if (membership?.membershipState == "active") {
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(OrganizationMemberRolesContext, queryRunner);
      const memberRoles = await organizationMemberRolesContext.getRolesByMember(
        membership
      );
      const roleIds = memberRoles?.map((r) => r.id);
      const protectedBranchRuleEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledRoleSettingsContext,
          queryRunner
        );
      const hasRoles =
        await protectedBranchRuleEnabledRoleSettingsContext.hasRepoRoleIds(
          repository.id,
          roleIds,
          settingName
        );
      if (hasRoles) {
        return true;
      }
    }
    const protectedBranchRuleEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        ProtectedBranchRuleEnabledUserSettingsContext,
        queryRunner
      );
    const hasUserPermission =
      await protectedBranchRuleEnabledUserSettingsContext.hasRepoUserId(
        protectedBranchRule.id,
        user.id,
        settingName
      );
    return hasUserPermission;
  }

  public async calculateUserRepositorySettingPermission(
    repository: Repository,
    user: User | null | undefined,
    settingName:
      | "anyoneCanRead"
      | "anyoneCanPushBranches"
      | "anyoneCanChangeSettings"
      | "anyoneCanWriteAnnouncements",
      queryRunner?: QueryRunner
  ): Promise<boolean> {
    if (!repository.isPrivate) {
      if (settingName == "anyoneCanRead") {
        return true;
      }
    }
    if (!user) {
      return false;
    }
    if (repository.repoType == "user_repo") {
      if (user.id == repository.createdByUserId) {
        if (repository.isPrivate && settingName == "anyoneCanWriteAnnouncements") {
          return false;
        }
        return true;
      }
      if (repository.isPrivate) {
        return false;
      }
      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext,
          queryRunner
        );
      const hasUserPermission =
        await repositoryEnabledUserSettingsContext.hasRepoUserId(
          repository.id,
          user.id,
          settingName
        );
      if (settingName == "anyoneCanChangeSettings") {
        return false;
      }
      if (
        hasUserPermission &&
        repository.allowExternalUsersToPush &&
        (settingName == "anyoneCanPushBranches")
      ) {
        return true;
      }
      return false;
    }
    // dealing with org case

    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext,
      queryRunner
    );
    const membership = await organizationsMembersContext.getByOrgIdAndUserId(
      repository.organizationId,
      user.id
    );
    if (repository.isPrivate && membership?.membershipState != "active") {
      return false;
    }

    if (
      settingName == "anyoneCanChangeSettings" &&
      membership?.membershipState != "active"
    ) {
      return false;
    }

    if (membership?.membershipState == "active") {
      if (repository[settingName]) {
        return true;
      }
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(OrganizationMemberRolesContext, queryRunner);
      const memberRoles = await organizationMemberRolesContext.getRolesByMember(
        membership
      );
      const roleIds = memberRoles?.map((r) => r.id);
      const repositoryEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledRoleSettingsContext,
          queryRunner
        );
      const hasRoles =
        await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
          repository.id,
          roleIds,
          settingName
        );
      if (hasRoles) {
        return true;
      }
    }
    const repositoryEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledUserSettingsContext,
        queryRunner
      );
    const hasUserPermission =
      await repositoryEnabledUserSettingsContext.hasRepoUserId(
        repository.id,
        user.id,
        settingName
      );

    return hasUserPermission;
  }

  public async filterPrivateOrgRepos(
    repositories: Array<Repository>,
    membership: OrganizationMember,
  ): Promise<Array<Repository>> {
    if (membership?.membershipState != "active") {
      return [];
    }
    const out: Array<Repository> = [];
    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const memberRoles =
      membership?.membershipState == "active"
        ? await organizationMemberRolesContext.getRolesByMember(membership)
        : [];

    const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
    if (isAdmin) {
      return repositories;
    }
    const repositoryEnabledRoleSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledRoleSettingsContext
      );

    const repositoryEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledUserSettingsContext
      );
    const roleIds = memberRoles?.map((r) => r.id);
    for (const repo of repositories) {
      if (repo.anyoneCanRead) {
        out.push(repo);
        continue;
      }

      const hasUserPermission =
        await repositoryEnabledUserSettingsContext.hasRepoUserId(
          repo.id,
          membership.userId,
          "anyoneCanRead"
        );
      if (hasUserPermission) {
        out.push(repo);
        continue;
      }
      const hasRoles =
        await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
          repo.id,
          roleIds,
          "anyoneCanRead"
        );
      if (hasRoles) {
        out.push(repo);
        continue;
      }
    }

    return out;
  }
}
