import { injectable, inject } from "inversify";

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
import { ProtectedBranchRuleEnabledUserSetting } from "@floro/database/src/entities/ProtectedBranchRuleEnabledUserSetting";
import ProtectedBranchRuleEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";

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
    branchId?: string
  ): Promise<boolean> {
    try {
      if (!currentUser?.id || !repository?.id) {
        return false;
      }
      const protectedBranchRulesContext = await this.contextFactory.createContext(
        ProtectedBranchRulesContext
      );
      if (branchId) {
        const protectedBranch = await protectedBranchRulesContext.getByRepoAndBranchId(
          repository.id,
          branchId
        );
        if (protectedBranch?.disableDirectPushing) {
          return false;
        }
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
        if (repository?.isPrivate) {
          if (!membership || membership?.membershipState != "active") {
            return false;
          }
        }

        if (!repository?.anyoneCanPushBranches) {
          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          if (membership && membership?.membershipState == "active") {
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(membership);
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext
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
      if (repository?.anyoneCanPushBranches) {
        return true;
      }
      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext
        );
      const hasUserPermission =
        await repositoryEnabledUserSettingsContext.hasRepoUserId(
          repository.id,
          currentUser.id,
          "anyoneCanPushBranches"
        );
      if (!hasUserPermission) {
        return false;
      }
      return true;
    } catch (e) {
      console.log("E", e);
      return false
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
    }
    return true;
  }

  public async calculateUserProtectedBranchRuleSettingPermission (
    protectedBranchRule: ProtectedBranchRule,
    repository: Repository,
    user: User,
    settingName:
      | "anyoneCanCreateMergeRequests"
      | "anyoneWithApprovalCanMerge"
      | "anyoneCanMergeMergeRequests"
      | "anyoneCanApproveMergeRequests"
      | "anyoneCanRevert"
      | "anyoneCanAutofix"
  ) {
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate) {
        return user.id == repository.createdByUserId;
      }

      if (protectedBranchRule[settingName]) {
        if (user.id != repository.createdByUserId) {
          if (settingName == "anyoneCanRevert") {
            return false;
          }

          if (settingName == "anyoneCanAutofix") {
            return false;
          }

          if (settingName == "anyoneCanApproveMergeRequests") {
            return false;
          }

          if (settingName == "anyoneCanMergeMergeRequests") {
            return false;
          }
        }
        return true;
      }
      const protectedBranchRuleEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledUserSettingsContext
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
      OrganizationMembersContext
    );
    const membership = await organizationsMembersContext.getByOrgIdAndUserId(
      repository.organizationId,
      user.id
    );
    if (repository.isPrivate && membership?.membershipState != "active") {
      return false;
    }

    if (protectedBranchRule[settingName]) {
      if (membership?.membershipState != "active") {
          if (settingName == "anyoneCanRevert") {
            return false;
          }
          if (settingName == "anyoneCanAutofix") {
            return false;
          }
          if (settingName == "anyoneCanApproveMergeRequests") {
            return false;
          }
          if (settingName == "anyoneCanMergeMergeRequests") {
            return false;
          }
      }
      return true;
    }

    if (membership?.membershipState == "active") {
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext
          );
      const memberRoles =
        await organizationMemberRolesContext.getRolesByMember(membership);
      const roleIds = memberRoles?.map((r) => r.id);
      const protectedBranchRuleEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledRoleSettingsContext
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
        ProtectedBranchRuleEnabledUserSettingsContext
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
    user: User,
    settingName:
      | "anyoneCanPushBranches"
      | "anyoneCanDeleteBranches"
      | "anyoneCanChangeSettings"
  ) {
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate || settingName == "anyoneCanChangeSettings") {
        return user.id == repository.createdByUserId;
      }

      if (repository[settingName]) {
        return true;
      }
      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext
        );
      const hasUserPermission =
        await repositoryEnabledUserSettingsContext.hasRepoUserId(
          repository.id,
          user.id,
          settingName
        );
      return hasUserPermission;
    }
    // dealing with org case

    const organizationsMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    const membership = await organizationsMembersContext.getByOrgIdAndUserId(
      repository.organizationId,
      user.id
    );
    if (repository.isPrivate && membership?.membershipState != "active") {
      return false;
    }

    if (settingName == "anyoneCanChangeSettings" && membership?.membershipState != "active") {
      return false;
    }

    if (repository[settingName]) {
      return true;
    }
    if (membership?.membershipState == "active") {
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext
          );
      const memberRoles =
        await organizationMemberRolesContext.getRolesByMember(membership);
      const roleIds = memberRoles?.map((r) => r.id);
      const repositoryEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledRoleSettingsContext
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
        RepositoryEnabledUserSettingsContext
      );
    const hasUserPermission =
      await repositoryEnabledUserSettingsContext.hasRepoUserId(
        repository.id,
        user.id,
        settingName
      );
    if (hasUserPermission) {
      return true;
    }
    return false;
  }
}
