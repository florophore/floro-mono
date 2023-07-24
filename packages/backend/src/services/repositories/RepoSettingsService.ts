import { injectable, inject, multiInject } from "inversify";

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
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import { query } from "express";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import BranchService from "./BranchService";
import RepositoryService from "./RepositoryService";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import GrantRepoAccessHandler from "../events/GrantRepoAccessHandler";

@injectable()
export default class RepoSettingsService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repositoryService!: RepositoryService;
  private grantAccessHandlers!: GrantRepoAccessHandler[];

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @multiInject("GrantRepoAccessHandler") grantAccessHandlers: GrantRepoAccessHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repositoryService = repositoryService;
    this.grantAccessHandlers = grantAccessHandlers;
  }

  public async getWriteAccessUserIds(
    repository: Repository
  ): Promise<Array<string>> {
    if (repository.isPrivate && repository.repoType == "user_repo") {
      return [repository.createdByUserId];
    }
    if (!repository.isPrivate && repository.repoType == "user_repo") {
      if (!repository.allowExternalUsersToPush) {
        return [repository.createdByUserId];
      }

      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext
        );
      const visited = new Set([repository.createdByUserId]);
      const out = [repository.createdByUserId];
      const enabledRepoUsers =
        await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
          repository.id,
          "anyoneCanPushBranches"
        );
      for (const enabledRepoUserSetting of enabledRepoUsers) {
        if (!visited.has(enabledRepoUserSetting.userId)) {
          visited.add(enabledRepoUserSetting.userId);
          out.push(enabledRepoUserSetting.userId);
        }
      }
      return out;
    }

    if (repository.isPrivate && repository.repoType == "org_repo") {
      const organizationMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const members =
        await organizationMembersContext.getAllMembersForOrganization(
          repository.organizationId
        );
      const activeUserIds = members
        ?.filter?.((m) => m.membershipState == "active")
        ?.map((m) => m.userId);
      if (repository.anyoneCanPushBranches) {
        return activeUserIds;
      }
      const out: Array<string> = [];
      const visited: Set<string> = new Set([]);
      const repositoryEnabledRolesSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledRoleSettingsContext
        );
      const enabledRoles =
        await repositoryEnabledRolesSettingsContext.getAllForRepositorySetting(
          repository.id,
          "anyoneCanPushBranches"
        );
      const roleIds = enabledRoles.map((er) => er.roleId);
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(OrganizationMemberRolesContext);
      const roleMembers =
        await organizationMemberRolesContext.getEnabledOrganizationMembersForRoleIds(
          repository.organizationId,
          roleIds
        );
      for (const roleMember of roleMembers) {
        if (!visited.has(roleMember.userId)) {
          visited.add(roleMember.userId);
          out.push(roleMember.userId);
        }
      }

      const activeUserIdsSet = new Set(activeUserIds);

      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext
        );
      const enabledOrgUsers =
        await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
          repository.id,
          "anyoneCanPushBranches"
        );
      for (const enabledOrgUser of enabledOrgUsers) {
        if (
          activeUserIdsSet.has(enabledOrgUser.userId) &&
          !visited.has(enabledOrgUser.userId)
        ) {
          visited.add(enabledOrgUser.userId);
          out.push(enabledOrgUser.userId);
        }
      }
      return out;
    }
    // public repo case

    const organizationMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    const members =
      await organizationMembersContext.getAllMembersForOrganization(
        repository.organizationId
      );
    const activeUserIds = members
      ?.filter?.((m) => m.membershipState == "active")
      ?.map((m) => m.userId);
    if (repository.anyoneCanPushBranches) {
      if (repository.allowExternalUsersToPush) {
        const out: Array<string> = [...activeUserIds];
        const visited: Set<string> = new Set(activeUserIds);
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledOrgUsers =
          await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanPushBranches"
          );
        for (const enabledOrgUser of enabledOrgUsers) {
          if (!visited.has(enabledOrgUser.userId)) {
            visited.add(enabledOrgUser.userId);
            out.push(enabledOrgUser.userId);
          }
        }
        return out;
      }
      return activeUserIds;
    }
    const out: Array<string> = [];
    const visited: Set<string> = new Set([]);
    const repositoryEnabledRolesSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledRoleSettingsContext
      );
    const enabledRoles =
      await repositoryEnabledRolesSettingsContext.getAllForRepositorySetting(
        repository.id,
        "anyoneCanPushBranches"
      );
    const roleIds = enabledRoles.map((er) => er.roleId);
    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const roleMembers =
      await organizationMemberRolesContext.getEnabledOrganizationMembersForRoleIds(
        repository.organizationId,
        roleIds
      );
    for (const roleMember of roleMembers) {
      if (!visited.has(roleMember.userId)) {
        visited.add(roleMember.userId);
        out.push(roleMember.userId);
      }
    }

    const activeUserIdsSet = new Set(activeUserIds);

    const repositoryEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledUserSettingsContext
      );
    const enabledOrgUsers =
      await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
        repository.id,
        "anyoneCanPushBranches"
      );
    for (const enabledOrgUser of enabledOrgUsers) {
      if (
        (activeUserIdsSet.has(enabledOrgUser.userId) ||
          repository.allowExternalUsersToPush) &&
        !visited.has(enabledOrgUser.userId)
      ) {
        visited.add(enabledOrgUser.userId);
        out.push(enabledOrgUser.userId);
      }
    }
    return out;
  }

  // SEARCH QUERIES
  public async searchUsersForRepoReadAccess(
    repository: Repository,
    query: string,
    excludedUserIds: string[]
  ) {
    if (repository.repoType == "user_repo" || !repository.isPrivate) {
      return [];
    }
    if (repository.anyoneCanRead) {
      return [];
    }
    // PUBLIC ORG CASE ONLY MATTERS
    const organizationMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    const members =
      await organizationMembersContext.getAllMembersForOrganization(
        repository.organizationId
      );
    const activeUserIds = members
      ?.filter?.((m) => m.membershipState == "active")
      ?.map((m) => m.userId);
    const usersContext = await this.contextFactory.createContext(UsersContext);
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      activeUserIds,
      excludedUserIds
    );
  }

  public async searchUsersForRepoCanAdjustRepoSettings(
    repository: Repository,
    query: string,
    excludedUserIds: string[]
  ) {
    if (repository.repoType == "user_repo") {
      return [];
    }
    const organizationMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    const members =
      await organizationMembersContext.getAllMembersForOrganization(
        repository.organizationId
      );
    const activeUserIds = members
      ?.filter?.((m) => m.membershipState == "active")
      ?.map((m) => m.userId);
    const usersContext = await this.contextFactory.createContext(UsersContext);
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      activeUserIds,
      excludedUserIds
    );
  }

  public async searchUsersForRepoPushAccess(
    repository: Repository,
    query: string,
    excludedUserIds: string[]
  ) {
    if (repository.repoType == "user_repo" && repository.isPrivate) {
      return [];
    }
    if (repository.repoType == "user_repo" || (!repository.isPrivate && repository?.repoType == "org_repo" && repository.allowExternalUsersToPush)) {
      if (repository.repoType == "user_repo" && !repository.allowExternalUsersToPush) {
        return [];
      }

      if (repository.repoType == "org_repo" && repository.anyoneCanPushBranches) {
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const members =
          await organizationMembersContext.getAllMembersForOrganization(
            repository.organizationId
          );
        const activeUserIds = members
          ?.filter?.((m) => m.membershipState == "active")
          ?.map((m) => m.userId);

        const usersContext = await this.contextFactory.createContext(
          UsersContext
        );
        return await usersContext.searchUsersExcludingIds(
          query,
          this.uniqueDefinedList([...activeUserIds, ...excludedUserIds])
        );
      }
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.searchUsersExcludingIds(
        query,
        this.uniqueDefinedList([...excludedUserIds, repository.userId])
      );
    }
    const organizationMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext);
    const members =
      await organizationMembersContext.getAllMembersForOrganization(
        repository.organizationId
      );
    const activeUserIds = members
      ?.filter?.((m) => m.membershipState == "active")
      ?.map((m) => m.userId);

    const usersContext = await this.contextFactory.createContext(
      UsersContext
    );
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      activeUserIds,
      excludedUserIds
    );
  }

  public async searchUsersForRepoDeleteAccess(
    repository: Repository,
    query: string,
    excludedUserIds: string[]
  ) {
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate || !repository.allowExternalUsersToPush) {
        return [];
      }
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      const writeAcessUserIds = await this.getWriteAccessUserIds(repository);
      return await usersContext.searchUsersIncludingIdsAndExcludingIds(
        query,
        writeAcessUserIds,
        excludedUserIds
      );
    }

    const writeAccessUserIds = await this.getWriteAccessUserIds(repository);
    const usersContext = await this.contextFactory.createContext(UsersContext);
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      writeAccessUserIds,
      excludedUserIds
    );
  }

  public async searchUsersForRepoProtectedBranchSettingAccess(
    repository: Repository,
    query: string,
    excludedUserIds: string[]
  ) {
    if (repository.repoType == "user_repo") {
      if (repository.isPrivate || !repository.allowExternalUsersToPush) {
        return [];
      }
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      const writeAcessUserIds = await this.getWriteAccessUserIds(repository);
      return await usersContext.searchUsersIncludingIdsAndExcludingIds(
        query,
        writeAcessUserIds,
        excludedUserIds
      );
    }

    const writeAccessUserIds = await this.getWriteAccessUserIds(repository);
    const usersContext = await this.contextFactory.createContext(UsersContext);
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      writeAccessUserIds,
      excludedUserIds
    );
  }

  public async searchUsersThatCanApproveMergeRequest(
    repository: Repository,
    mergeRequestUser: User,
    baseBranchId: string,
    excludedUserIds: string,
    query: string
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getByRepoAndBranchId(
      repository.id,
      baseBranchId
    );
    const writeAcessUserIds = await this.getWriteAccessUserIds(repository);

    const usersContext = await this.contextFactory.createContext(UsersContext);
    if (!branchRule) {
      return await usersContext.searchUsersIncludingIdsAndExcludingIds(
        query,
        writeAcessUserIds,
        [...excludedUserIds, mergeRequestUser.id]
      );
    }

    if (branchRule?.anyoneCanApproveMergeRequests) {
      return await usersContext.searchUsersIncludingIdsAndExcludingIds(
        query,
        writeAcessUserIds,
        [...excludedUserIds, mergeRequestUser.id]
      );
    }

    const visited: Set<string> = new Set([]);
    const userIdsWithApprovalPermission: Array<string> = [];
    const writeAccessSet = new Set(writeAcessUserIds);

    const protectedBranchRuleEnabledRoleSettingsContext =
      await this.contextFactory.createContext(
        ProtectedBranchRuleEnabledRoleSettingsContext
      );
    const enabledRoles =
      await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
        branchRule.id,
        "anyoneCanApproveMergeRequests"
      );
    const roleIds = enabledRoles.map((er) => er.roleId);
    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const roleMembers =
      await organizationMemberRolesContext.getEnabledOrganizationMembersForRoleIds(
        repository.organizationId,
        roleIds
      );

    for (const enabledRoleMember of roleMembers) {
      if (
        writeAccessSet.has(enabledRoleMember.userId) &&
        !visited.has(enabledRoleMember.userId)
      ) {
        visited.add(enabledRoleMember.userId);
        userIdsWithApprovalPermission.push(enabledRoleMember.userId);
      }
    }
    const protectedBranchRulesEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        ProtectedBranchRulesEnabledUserSettingsContext
      );
    const enabledUsers =
      await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
        branchRule.id,
        "anyoneCanApproveMergeRequests"
      );

    for (const enabledOrgUser of enabledUsers) {
      if (
        writeAccessSet.has(enabledOrgUser.userId) &&
        !visited.has(enabledOrgUser.userId)
      ) {
        visited.add(enabledOrgUser.userId);
        userIdsWithApprovalPermission.push(enabledOrgUser.userId);
      }
    }
    return await usersContext.searchUsersIncludingIdsAndExcludingIds(
      query,
      userIdsWithApprovalPermission,
      [...excludedUserIds, mergeRequestUser.id]
    );
  }

  private uniqueDefinedList(list: Array<string>): Array<string> {
    const out: Array<string> = [];
    const seen: Set<string> = new Set([]);
    for (const value of list) {
      if (value && value != "" && !seen.has(value)) {
        seen.add(value);
        out.push(value);
      }
    }
    return out;
  }

  private listsOverlap(listA: Array<string>, listB: Array<string>): boolean {
    const setB: Set<string> = new Set(listB);
    for (const value of listA) {
      if (value && setB.has(value)) {
        return true;
      }
    }
    return false;
  }

  private getAddedIds(oldIds: Array<string>, newIds: Array<string>): Array<string> {
    const exists: Set<string> = new Set(oldIds);
    const  out: Array<string> = [];
    for (const value of newIds) {
      if (value && !exists.has(value)) {
        out.push(value);
        exists.add(value);
      }
    }
    return out;
  }

  private async updateRepoAnyoneSettingAccess(
    repository: Repository,
    settingName:
      | "anyoneCanRead"
      | "anyoneCanPushBranches"
      | "anyoneCanChangeSettings",
    userIds: string[],
    roleIds: string[]
  ) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    // unique userIds and roleIds
    try {
      await queryRunner.startTransaction();

      const repositoryEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledRoleSettingsContext,
          queryRunner
        );
      await repositoryEnabledRoleSettingsContext.deleteRepoRoleSettings(
        repository.id,
        settingName
      );
      const repositoryEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          RepositoryEnabledUserSettingsContext,
          queryRunner
        );
      await repositoryEnabledUserSettingsContext.deleteRepoUserSettings(
        repository.id,
        settingName
      );

      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );

      const uniqueRoleIds = this.uniqueDefinedList(roleIds);

      for (const roleId of uniqueRoleIds) {
        const role = await organizationRolesContext.getById(roleId);
        if (role?.organizationId == repository.organizationId) {
          await repositoryEnabledRoleSettingsContext.create({
            settingName,
            repositoryId: repository.id,
            roleId: role.id,
          });
        }
      }

      const uniqueUserIds = this.uniqueDefinedList(userIds);
      for (const userId of uniqueUserIds) {
        if (settingName == "anyoneCanRead") {
          // only applies to private org repo case
          if (repository.isPrivate && repository.repoType == "org_repo") {
            const membership =
              await organizationMembersContext.getByOrgIdAndUserId(
                repository.organizationId,
                userId
              );
            if (membership?.membershipState == "active") {
              await repositoryEnabledUserSettingsContext.create({
                settingName,
                repositoryId: repository.id,
                userId,
              });
            }
          }
        }
        if (settingName == "anyoneCanChangeSettings") {
          if (repository.repoType == "org_repo") {
            const membership =
              await organizationMembersContext.getByOrgIdAndUserId(
                repository.organizationId,
                userId
              );
            if (membership?.membershipState == "active") {
              await repositoryEnabledUserSettingsContext.create({
                settingName,
                repositoryId: repository.id,
                userId,
              });
            }
          }
        }

        if (settingName == "anyoneCanPushBranches") {
          if (
            repository.repoType == "user_repo" &&
            !repository.isPrivate &&
            repository.allowExternalUsersToPush
          ) {
            await repositoryEnabledUserSettingsContext.create({
              settingName,
              repositoryId: repository.id,
              userId,
            });
          }
          if (repository.repoType == "org_repo") {
            if (!repository.isPrivate) {
              if (repository.allowExternalUsersToPush) {
                await repositoryEnabledUserSettingsContext.create({
                  settingName,
                  repositoryId: repository.id,
                  userId,
                });
              } else {
                const membership =
                  await organizationMembersContext.getByOrgIdAndUserId(
                    repository.organizationId,
                    userId
                  );
                if (membership?.membershipState == "active") {
                  await repositoryEnabledUserSettingsContext.create({
                    settingName,
                    repositoryId: repository.id,
                    userId,
                  });
                }
              }
            }
            if (repository.isPrivate) {
              const membership =
                await organizationMembersContext.getByOrgIdAndUserId(
                  repository.organizationId,
                  userId
                );
              if (membership?.membershipState == "active") {
                await repositoryEnabledUserSettingsContext.create({
                  settingName,
                  repositoryId: repository.id,
                  userId,
                });
              }
            }
          }
        }
      }
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
  // for protected branch, we need to confirm the write permissions of the user

  private async updateRepoBranchRuleAnyoneSettingAccess(
    repository: Repository,
    branchRule: ProtectedBranchRule,
    settingName:
      | "anyoneCanCreateMergeRequests"
      | "anyoneWithApprovalCanMerge"
      | "anyoneCanMergeMergeRequests"
      | "anyoneCanApproveMergeRequests"
      | "anyoneCanRevert"
      | "anyoneCanAutofix",
    userIds: string[],
    roleIds: string[],
  ) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    const userWriteIds = await this.getWriteAccessUserIds(repository);
    const userWriteIdsSets = new Set(userWriteIds);
    const uniqueRoleIds = this.uniqueDefinedList(roleIds);
    const uniqueUserIds = this.uniqueDefinedList(userIds);
    // unique userIds and roleIds
    try {
      await queryRunner.startTransaction();

      const protectedBranchRuleEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledRoleSettingsContext,
          queryRunner
        );

      await protectedBranchRuleEnabledRoleSettingsContext.deleteBranchRuleRoleSettings(
        branchRule.id,
        settingName
      );
      const protectedBranchRuleEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesEnabledUserSettingsContext,
          queryRunner
        );
      await protectedBranchRuleEnabledUserSettingsContext.deleteBranchRoleUserSettings(
        branchRule.id,
        settingName
      );

      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );

      for (const roleId of uniqueRoleIds) {
        const role = await organizationRolesContext.getById(roleId);
        if (role?.organizationId == repository.organizationId) {
          await protectedBranchRuleEnabledRoleSettingsContext.create({
            settingName,
            protectedBranchRuleId: branchRule.id,
            roleId: role.id,
          });
        }
      }
      for (const userId of uniqueUserIds) {
        if (userWriteIdsSets.has(userId)) {
          await protectedBranchRuleEnabledUserSettingsContext.create({
            settingName,
            protectedBranchRuleId: branchRule.id,
            userId,
          });
        }
      }

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

  // SETTINGS UPDATES
  public async updateAnyoneCanChangeSettings(
    repository: Repository,
    anyoneCanChangeSettings: boolean,
    user: User
  ) {
    if (repository.repoType == "user_repo") {
      return null;
    }
    // test if admin

    const organizationMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext);
    const membership = await organizationMembersContext.getByOrgIdAndUserId(repository.organizationId, user.id);
    if (membership?.membershipState != "active") {
      return null;
    }

    if (!anyoneCanChangeSettings) {
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
      );
      const adminRole = await organizationRolesContext.getRoleForOrgByPresetName(repository.organizationId, "admin");

      const organizationMemberRolesContext = await this.contextFactory.createContext(
        OrganizationMemberRolesContext,
      );

      const memberRoles = await organizationMemberRolesContext.getRolesByMemberId(membership?.id);
      const hasAdminRole = !!memberRoles?.find(r => r.id == adminRole.id);
      if (!hasAdminRole) {
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers = await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanChangeSettings");
        const enabledUserIds = enabledUsers.map(eu => eu.userId);
        if (!enabledUserIds.includes(user.id)) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoles = await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanChangeSettings");
          const memberRoleIds = memberRoles?.map(role => role.id);
          const enabledRoleIds = enabledRoles.map(er => er.roleId);
          if (!this.listsOverlap(enabledRoleIds, memberRoleIds)) {
            return null;
          }
        }
      }
    }

    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.updateRepo(repository, {
      anyoneCanChangeSettings,
    });
  }

  public async updateSettingsAccess(
    repository: Repository,
    roleIds: string[],
    userIds: string[],
    user: User
  ) {
    if (repository.repoType == "user_repo") {
      return null;
    }

    if (!repository.anyoneCanChangeSettings) {
      const organizationMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationMembersContext.getByOrgIdAndUserId(repository.organizationId, user.id);
      if (membership?.membershipState != "active") {
        return null;
      }

      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
      );
      const adminRole = await organizationRolesContext.getRoleForOrgByPresetName(repository.organizationId, "admin");
      const organizationMemberRolesContext = await this.contextFactory.createContext(
        OrganizationMemberRolesContext,
      );
      const memberRoles = await organizationMemberRolesContext.getRolesByMemberId(membership?.id);
      const hasAdminRole = !!memberRoles?.find(r => r.id == adminRole.id);
      if (!hasAdminRole) {
        if (!userIds.includes(user.id)) {
          const memberRoleIds = memberRoles?.map(role => role.id);
          if (!this.listsOverlap(memberRoleIds, roleIds)) {
            return null
          }
        }
      }
    }

    // DIFF IDS HERE
    const didUpdate = await this.updateRepoAnyoneSettingAccess(
      repository,
      "anyoneCanChangeSettings",
      userIds,
      roleIds
    );
    if (didUpdate) {
      return repository;
    }
    return null;
  }

  public async updateDefaultBranch(repository: Repository, branchId: string) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      // check for existence of branch (if not exist, then delete)
      // check for existence of baseBranchRule

      const branches = await this.repositoryService.getBranches(
        repository.id,
        queryRunner
      );
      const branch = branches.find((b) => b.id == branchId);
      if (!branchId || !branch) {
        return null;
      }

      const protectedBranchRulesContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
          queryRunner
        );
      const rule = await protectedBranchRulesContext.getByRepoAndBranchId(
        repository.id,
        branchId
      );
      if (!rule) {
        await protectedBranchRulesContext.create({
          branchId: branch.id,
          branchName: branch.name,
          disableDirectPushing: true,
          requireApprovalToMerge: true,
          automaticallyDeleteMergedFeatureBranches: true,
          anyoneCanCreateMergeRequests: true,
          anyoneWithApprovalCanMerge: true,
          requireReapprovalOnPushToMerge: true,
          anyoneCanMergeMergeRequests:
            repository.isPrivate && repository.repoType == "user_repo",
          anyoneCanApproveMergeRequests: repository.isPrivate,
          anyoneCanRevert: repository.isPrivate,
          anyoneCanAutofix: repository.isPrivate,
          repositoryId: repository?.id,
        });
      }

      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const updatedRepo = await repositoriesContext.updateRepo(repository, {
        defaultBranchId: branchId,
      });
      await queryRunner.commitTransaction();
      return updatedRepo;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return null;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async updateAnyoneCanRead(
    repository: Repository,
    anyoneCanRead: boolean,
    user: User
  ) {
    if (!repository.isPrivate || repository.repoType != "org_repo") {
      return null;
    }

    const organizationMembersContext =
      await this.contextFactory.createContext(OrganizationMembersContext);
    const membership = await organizationMembersContext.getByOrgIdAndUserId(repository.organizationId, user.id);
    if (membership?.membershipState != "active") {
      return null;
    }

    if (!anyoneCanRead) {
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
      );
      const adminRole = await organizationRolesContext.getRoleForOrgByPresetName(repository.organizationId, "admin");

      const organizationMemberRolesContext = await this.contextFactory.createContext(
        OrganizationMemberRolesContext,
      );

      const memberRoles = await organizationMemberRolesContext.getRolesByMemberId(membership?.id);
      const hasAdminRole = !!memberRoles?.find(r => r.id == adminRole.id);
      if (!hasAdminRole) {
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers = await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanRead");
        const enabledUserIds = enabledUsers.map(eu => eu.userId);
        if (!enabledUserIds.includes(user.id)) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoles = await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanRead");
          const memberRoleIds = memberRoles?.map(role => role.id);
          const enabledRoleIds = enabledRoles.map(er => er.roleId);
          if (!this.listsOverlap(enabledRoleIds, memberRoleIds)) {
            return null;
          }
        }
      }
    }
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.updateRepo(repository, {
      anyoneCanRead,
    });
  }

  public async updateReadAccess(
    repository: Repository,
    roleIds: string[],
    userIds: string[],
    user: User
  ) {
    if (!repository.isPrivate || repository.repoType != "org_repo") {
      return null;
    }
    if (!repository.anyoneCanRead) {
      const organizationMembersContext =
        await this.contextFactory.createContext(OrganizationMembersContext);
      const membership = await organizationMembersContext.getByOrgIdAndUserId(repository.organizationId, user.id);
      if (membership?.membershipState != "active") {
        return null;
      }

      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
      );
      const adminRole = await organizationRolesContext.getRoleForOrgByPresetName(repository.organizationId, "admin");
      const organizationMemberRolesContext = await this.contextFactory.createContext(
        OrganizationMemberRolesContext,
      );
      const memberRoles = await organizationMemberRolesContext.getRolesByMemberId(membership?.id);
      const hasAdminRole = !!memberRoles?.find(r => r.id == adminRole.id);
      if (!hasAdminRole) {
        if (!userIds.includes(user.id)) {
          const memberRoleIds = memberRoles?.map(role => role.id);
          if (!this.listsOverlap(memberRoleIds, roleIds)) {
            return null
          }
        }
      }
    }

    const repositoryEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledUserSettingsContext
      );
    const enabledUsers = await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanRead");
    const enabledUserIds = enabledUsers.map(eu => eu.userId);
    const addedIds = this.getAddedIds(enabledUserIds, userIds)?.filter(
      (v) => v != user.id
    );

    // check that user has role id, user level, is admin
    const didUpdate = await this.updateRepoAnyoneSettingAccess(
      repository,
      "anyoneCanRead",
      userIds,
      roleIds
    );
    if (didUpdate) {
      const usersContext =
        await this.contextFactory.createContext(
          UsersContext
        );
      for (const addedId of addedIds) {
        const userGrantedAccessTo = await usersContext.getById(addedId);
        if (userGrantedAccessTo) {
          for (const handler of this.grantAccessHandlers) {
            await handler.onGrantReadAccess(repository, user, userGrantedAccessTo);
          }
        }
      }
      return repository;
    }
    return null;
  }

  public async updateAnyoneCanPushBranches(
    repository: Repository,
    anyoneCanPushBranches: boolean
  ) {
    if (repository.isPrivate && repository.repoType != "org_repo") {
      return null;
    }
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.updateRepo(repository, {
      anyoneCanPushBranches,
    });
  }

  public async updatePushBranchesAccess(
    repository: Repository,
    roleIds: string[],
    userIds: string[],
    user: User
  ) {
    if (repository.isPrivate && repository.repoType != "org_repo") {
      return null;
    }

    const repositoryEnabledUserSettingsContext =
      await this.contextFactory.createContext(
        RepositoryEnabledUserSettingsContext
      );
    const enabledUsers = await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(repository.id, "anyoneCanPushBranches");
    const enabledUserIds = enabledUsers.map(eu => eu.userId);
    const addedIds = this.getAddedIds(enabledUserIds, userIds)?.filter(
      (v) => v != user.id
    );
    const didUpdate = await this.updateRepoAnyoneSettingAccess(
      repository,
      "anyoneCanPushBranches",
      userIds,
      roleIds
    );
    if (didUpdate) {
      const usersContext =
        await this.contextFactory.createContext(
          UsersContext
        );
      for (const addedId of addedIds) {
        const userGrantedAccessTo = await usersContext.getById(addedId);
        if (userGrantedAccessTo) {
          for (const handler of this.grantAccessHandlers) {
            await handler.onGrantWriteAccess(repository, user, userGrantedAccessTo);
          }
        }
      }
      return repository;
    }
    return null;
  }

  public async updateAllowExternalUsersToPush(
    repository: Repository,
    allowExternalUsersToPush: boolean
  ) {
    if (repository.isPrivate && repository.repoType != "org_repo") {
      return null;
    }
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.updateRepo(repository, {
      allowExternalUsersToPush,
    });
  }


  public async updateBranchRuleSettingValue(
    repository: Repository,
    branchRuleId: string,
    settingName:
      | "anyoneCanCreateMergeRequests"
      | "anyoneWithApprovalCanMerge"
      | "anyoneCanMergeMergeRequests"
      | "anyoneCanApproveMergeRequests"
      | "anyoneCanRevert"
      | "anyoneCanAutofix",
    settingValue: boolean
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    return await protectedBranchRulesContext.updateProtectedBranchRule(branchRule, {
      [settingName]: settingValue
    })
  }

  public async updateBranchRuleSettingAccess(
    repository: Repository,
    branchRuleId: string,
    settingName:
      | "anyoneCanCreateMergeRequests"
      | "anyoneWithApprovalCanMerge"
      | "anyoneCanMergeMergeRequests"
      | "anyoneCanApproveMergeRequests"
      | "anyoneCanRevert"
      | "anyoneCanAutofix",
    roleIds: string[],
    userIds: string[],
  ) {

    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    const didUpdate = await this.updateRepoBranchRuleAnyoneSettingAccess(repository, branchRule, settingName, userIds, roleIds)
    if (didUpdate) {
      return repository;
    }
    return null;
  }


  //public async updateProtectedBranchRuleSetting(
  //  protectedBranchRule: ProtectedBranchRule,
  //  settingsName:
  //    | "disableDirectPushing"
  //    | "requireApprovalToMerge"
  //    | "requireReapprovalOnPushToMerge"
  //    | "automaticallyDeleteMergedFeatureBranches"
  //    | "anyoneCanCreateMergeRequests"
  //    | "anyoneWithApprovalCanMerge"
  //    | "anyoneCanMergeMergeRequests"
  //    | "anyoneCanApproveMergeRequests"
  //    | "anyoneCanRevert"
  //    | "anyoneCanAutofix",
  //  settingValue: boolean
  //) {
  //  const protectedBranchRulesContext = await this.contextFactory.createContext(
  //    ProtectedBranchRulesContext
  //  );
  //  return await protectedBranchRulesContext.updateProtectedBranchRule(protectedBranchRule, {
  //    [settingsName]: settingValue
  //  });
  //}

  public async updateBranchRuleDisableDirectPushing(
    repository: Repository,
    branchRuleId: string,
    disableDirectPushing: boolean
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    return await protectedBranchRulesContext.updateProtectedBranchRule(branchRule, {
      disableDirectPushing
    })
  }

  public async updateBranchRuleRequireApprovalToMerge(
    repository: Repository,
    branchRuleId: string,
    requireApprovalToMerge: boolean
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    return await protectedBranchRulesContext.updateProtectedBranchRule(branchRule, {
      requireApprovalToMerge
    })
  }

  public async updateBranchRuleRequireReapprovalOnPushToMerge(
    repository: Repository,
    branchRuleId: string,
    requireReapprovalOnPushToMerge: boolean
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    return await protectedBranchRulesContext.updateProtectedBranchRule(branchRule, {
      requireReapprovalOnPushToMerge
    })
  }

  public async updateBranchRuleAutomaticallyDeleteMergedFeatureBranches(
    repository: Repository,
    branchRuleId: string,
    automaticallyDeleteMergedFeatureBranches: boolean
  ) {
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
    if (!branchRule || branchRule?.repositoryId != repository.id) {
      return null;
    }
    return await protectedBranchRulesContext.updateProtectedBranchRule(branchRule, {
      automaticallyDeleteMergedFeatureBranches
    })
  }

  public async deleteBranchRule(repository: Repository, branchRuleId: string) {
    // block this if repository default branch id

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    // unique userIds and roleIds
    try {
      await queryRunner.startTransaction();
      const protectedBranchRulesContext = await this.contextFactory.createContext(
        ProtectedBranchRulesContext,
        queryRunner
      );
      const branchRule = await protectedBranchRulesContext.getById(branchRuleId);
      if (!branchRule || branchRule?.repositoryId != repository.id) {
        return null;
      }
      if (branchRule.branchId == repository.defaultBranchId) {
        return null
      }

      const protectedBranchRuleEnabledUserSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRulesEnabledUserSettingsContext,
          queryRunner
        );

      const protectedBranchRuleEnabledRoleSettingsContext =
        await this.contextFactory.createContext(
          ProtectedBranchRuleEnabledRoleSettingsContext
        );
      // delete users and rules
      await protectedBranchRuleEnabledUserSettingsContext.deleteAllForBranchRule(branchRule.id);
      await protectedBranchRuleEnabledRoleSettingsContext.deleteAllForBranchRule(branchRule.id);
      await protectedBranchRulesContext.deleteBranchRule(branchRule.id)
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

    //
  }
}