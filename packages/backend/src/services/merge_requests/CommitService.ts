import { injectable, inject } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import {
  EMPTY_COMMIT_STATE,
  applyStateDiffToCommitState,
  getInvalidStates,
  convertCommitStateToRenderedState,
} from "floro/dist/src/repo";
import { collectFileRefs } from "floro/dist/src/plugins";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import PluginVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import { Manifest, manifestListToSchemaMap } from "floro/dist/src/plugins";
import { makeDataSource } from "floro/dist/src/datasource";
import sizeof from "object-sizeof";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import BinaryCommitUtilizationsContext from "@floro/database/src/contexts/repositories/BinaryCommitUtilizationsContext";
import BinariesContext from "@floro/database/src/contexts/repositories/BinariesContext";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";
import { CommitData } from "floro/dist/src/sequenceoperations";

@injectable()
export default class CommitService {
  private contextFactory!: ContextFactory;
  public repoAccessor!: RepoAccessor;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor
  ) {
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
  }

  public async writeCommitList(
    repository: Repository,
    commitList: CommitData[]
  ): Promise<boolean> {
    const usersContext = await this.contextFactory.createContext(UsersContext);

    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );

    const pluginVersionsContext = await this.contextFactory.createContext(
      PluginVersionsContext
    );
    const pluginsContext = await this.contextFactory.createContext(
      PluginsContext
    );

    const organizationsContext = await this.contextFactory.createContext(
      OrganizationsContext
    );

    const binariesContext = await this.contextFactory.createContext(
      BinariesContext
    );

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);

    const binaryCommitUtilizationsContext =
      await this.contextFactory.createContext(BinaryCommitUtilizationsContext);

    let previousCommitKV = !commitList[0]?.parent
      ? EMPTY_COMMIT_STATE
      : await this.repoAccessor.readCommitKV(
          repository,
          commitList[0]?.parent as string
        );
    if (!previousCommitKV) {
      previousCommitKV = EMPTY_COMMIT_STATE;
    }
    for (const commitData of commitList) {
      const previousCommitKV = !commitData?.parent
        ? EMPTY_COMMIT_STATE
        : await this.repoAccessor.readCommitKV(repository, commitData?.parent);
      if (!commitData?.sha) {
        return false;
      }
      const repoHasCommit = await commitsContext.repoHasCommit(
        repository.id,
        commitData.sha
      );
      if (repoHasCommit) {
        continue;
      }

      const kvState = applyStateDiffToCommitState(
        previousCommitKV ?? EMPTY_COMMIT_STATE,
        commitData.diff
      );

      const manifests: Array<Manifest> = await Promise.all(
        kvState.plugins.map(async ({ key, value }) => {
          const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
            key,
            value
          );
          return JSON.parse(pluginVersion?.manifest ?? "") as Manifest;
        })
      );

      const schemaMap = manifestListToSchemaMap(manifests);
      const datasource = makeDataSource({
        getPluginManifest: async (pluginName: string) => {
          return schemaMap[pluginName];
        },
      });
      const apiStoreInvalidity = await getInvalidStates(datasource, kvState);

      let isValid = true;
      for (const plugin in apiStoreInvalidity) {
        if ((apiStoreInvalidity[plugin]?.length ?? 0) > 0) {
          isValid = false;
          break;
        }
      }

      const state = await convertCommitStateToRenderedState(
        datasource,
        kvState
      );
      const binaries = await collectFileRefs(
        datasource,
        schemaMap,
        state.store
      );

      const didWriteCommit = await this.repoAccessor.writeCommit(
        repository,
        commitData
      );

      if (!didWriteCommit) {
        return false;
      }

      const didWriteKV = await this.repoAccessor.writeCommitKV(
        repository,
        commitData.sha,
        kvState
      );
      if (!didWriteKV) {
        return false;
      }

      const didWriteState = await this.repoAccessor.writeCommitState(
        repository,
        commitData.sha,
        state
      );
      if (!didWriteState) {
        return false;
      }

      const repoHasCommitFinalCheck = await commitsContext.repoHasCommit(
        repository.id,
        commitData.sha
      );

      if (repoHasCommitFinalCheck) {
        continue;
      }

      const byteSize = sizeof(commitData) + sizeof(kvState) + sizeof(state);

      if (repository?.isPrivate) {
        if (repository.repoType == "org_repo") {
          const organization = await organizationsContext.getById(
            repository.organizationId
          );
          const utilizedDiskSpaceBytes = parseInt(
            organization?.utilizedDiskSpaceBytes as unknown as string
          );
          await organizationsContext.updateOrganizationById(
            organization?.id as string,
            {
              utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
            }
          );
        } else {
          const user = await usersContext.getById(repository.userId);
          if (user) {
            const utilizedDiskSpaceBytes = parseInt(
              user?.utilizedDiskSpaceBytes as unknown as string
            );
            await usersContext.updateUserById(user.id as string, {
              utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
            });
          }
        }
      }

      const parent = commitData?.parent
        ? await commitsContext?.getCommitBySha(
            repository.id,
            commitData?.parent
          )
        : undefined;
      const parentId = parent?.id ?? undefined;

      const diffByteSize = sizeof(commitData);
      const kvByteSize = sizeof(kvState);
      const stateByteSize = sizeof(state);
      const insertedCommit = await commitsContext.create({
        sha: commitData.sha,
        parent: commitData.parent as string,
        parentId,
        message: commitData.message,
        historicalParent: commitData?.historicalParent as string,
        idx: commitData?.idx as number,
        mergeBase: commitData?.mergeBase as string,
        mergeRevertSha: commitData?.mergeRevertSha as string,
        revertFromSha: commitData?.revertFromSha as string,
        revertToSha: commitData?.revertToSha as string,
        byteSize,
        diffByteSize,
        kvByteSize,
        stateByteSize,
        isValid,
        username: commitData.username,
        originalSha: commitData.originalSha,
        userId: commitData.userId,
        authorUsername: commitData.authorUsername ?? commitData?.username,
        authorUserId: commitData.authorUserId ?? commitData?.userId,
        timestamp: commitData.timestamp,
        organizationId: repository?.organizationId,
        repositoryId: repository?.id,
      });

      const seenBinaries = new Set<string>();
      for (const binary of binaries) {
        if (!seenBinaries.has(binary)) {
          // insert binary_utilizations
          const bin = await binariesContext.getRepoBinaryByFilename(
            repository.id,
            binary
          );
          // if not, this will blow up the world
          if (bin) {
            await binaryCommitUtilizationsContext.create({
              commitSha: commitData.sha,
              commitId: insertedCommit.id,
              userId: commitData.userId,
              organizationId: repository?.organizationId ?? undefined,
              repositoryId: repository?.id,
              binaryId: bin.id,
              binaryHash: bin.sha,
              binaryFileName: bin.fileName,
            });
          }
          seenBinaries.add(binary);
        }
      }

      for (const {
        key: pluginName,
        value: pluginVersionNumber,
      } of state.plugins) {
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          pluginName,
          pluginVersionNumber
        );

        if (!pluginVersion) {
          return false;
        }

        const plugin = await pluginsContext.getByNameKey(pluginVersion.nameKey);
        if (!plugin) {
          return false;
        }
        const pluginId = plugin.id;
        const pluginVersionId = pluginVersion.id;
        const additions = Object.keys(
          commitData?.diff?.store?.[pluginName]?.add ?? {}
        ).length;
        const removals = Object.keys(
          commitData?.diff?.store?.[pluginName]?.remove ?? {}
        ).length;
        const byteSize = sizeof(state.store[pluginName]);
        await pluginCommitUtilizationsContext.create({
          commitSha: commitData.sha,
          commitId: insertedCommit.id,
          userId: commitData.userId,
          organizationId: repository?.organizationId ?? undefined,
          repositoryId: repository?.id,
          pluginId,
          pluginVersionId,
          pluginName,
          pluginVersionNumber,
          additions,
          removals,
          byteSize,
        });
      }
    }
    return true;
  }

  public async writeCommit(
    repository: Repository,
    commitData: CommitData
  ): Promise<boolean> {
    const usersContext = await this.contextFactory.createContext(UsersContext);

    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );

    const pluginVersionsContext = await this.contextFactory.createContext(
      PluginVersionsContext
    );
    const pluginsContext = await this.contextFactory.createContext(
      PluginsContext
    );

    const organizationsContext = await this.contextFactory.createContext(
      OrganizationsContext
    );

    const binariesContext = await this.contextFactory.createContext(
      BinariesContext
    );

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);

    const binaryCommitUtilizationsContext =
      await this.contextFactory.createContext(BinaryCommitUtilizationsContext);

    let previousCommitKV = !commitData?.parent
      ? EMPTY_COMMIT_STATE
      : await this.repoAccessor.readCommitKV(
          repository,
          commitData?.parent as string
        );
      if (!previousCommitKV) {
        previousCommitKV = EMPTY_COMMIT_STATE;
      }
      if (!commitData?.sha) {
        return false;
      }
      const repoHasCommit = await commitsContext.repoHasCommit(
        repository.id,
        commitData.sha
      );

      if (repoHasCommit) {
        return true;
      }

      const kvState = applyStateDiffToCommitState(
        previousCommitKV ?? EMPTY_COMMIT_STATE,
        commitData.diff
      );

      const manifests: Array<Manifest> = await Promise.all(
        kvState.plugins.map(async ({ key, value }) => {
          const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
            key,
            value
          );
          return JSON.parse(pluginVersion?.manifest ?? "") as Manifest;
        })
      );

      const schemaMap = manifestListToSchemaMap(manifests);
      const datasource = makeDataSource({
        getPluginManifest: async (pluginName: string) => {
          return schemaMap[pluginName];
        },
      });
      const apiStoreInvalidity = await getInvalidStates(datasource, kvState);

      let isValid = true;
      for (const plugin in apiStoreInvalidity) {
        if ((apiStoreInvalidity[plugin]?.length ?? 0) > 0) {
          isValid = false;
          break;
        }
      }

      const state = await convertCommitStateToRenderedState(
        datasource,
        kvState
      );
      const binaries = await collectFileRefs(
        datasource,
        schemaMap,
        state.store
      );

      const didWriteCommit = await this.repoAccessor.writeCommit(
        repository,
        commitData
      );

      if (!didWriteCommit) {
        return false;
      }

      const didWriteKV = await this.repoAccessor.writeCommitKV(
        repository,
        commitData.sha,
        kvState
      );
      if (!didWriteKV) {
        return false;
      }

      const didWriteState = await this.repoAccessor.writeCommitState(
        repository,
        commitData.sha,
        state
      );
      if (!didWriteState) {
        return false;
      }

      const repoHasCommitFinalCheck = await commitsContext.repoHasCommit(
        repository.id,
        commitData.sha
      );

      previousCommitKV = kvState;

      if (repoHasCommitFinalCheck) {
        return true;
      }

      const byteSize = sizeof(commitData) + sizeof(kvState) + sizeof(state);

      if (repository?.isPrivate) {
        if (repository.repoType == "org_repo") {
          const organization = await organizationsContext.getById(
            repository.organizationId
          );
          const utilizedDiskSpaceBytes = parseInt(
            organization?.utilizedDiskSpaceBytes as unknown as string
          );
          await organizationsContext.updateOrganizationById(
            organization?.id as string,
            {
              utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
            }
          );
        } else {
          const user = await usersContext.getById(repository.userId);
          if (user) {
            const utilizedDiskSpaceBytes = parseInt(
              user?.utilizedDiskSpaceBytes as unknown as string
            );
            await usersContext.updateUserById(user.id as string, {
              utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
            });
          }
        }
      }

      const parent = commitData?.parent
        ? await commitsContext?.getCommitBySha(
            repository.id,
            commitData?.parent
          )
        : undefined;
      const parentId = parent?.id ?? undefined;

      const diffByteSize = sizeof(commitData);
      const kvByteSize = sizeof(kvState);
      const stateByteSize = sizeof(state);
      const insertedCommit = await commitsContext.create({
        sha: commitData.sha,
        parent: commitData.parent as string,
        parentId,
        message: commitData.message,
        historicalParent: commitData?.historicalParent as string,
        idx: commitData?.idx as number,
        mergeBase: commitData?.mergeBase as string,
        mergeRevertSha: commitData?.mergeRevertSha as string,
        revertFromSha: commitData?.revertFromSha as string,
        revertToSha: commitData?.revertToSha as string,
        byteSize,
        diffByteSize,
        kvByteSize,
        stateByteSize,
        isValid,
        username: commitData.username,
        originalSha: commitData.originalSha,
        userId: commitData.userId,
        authorUsername: commitData.authorUsername ?? commitData?.username,
        authorUserId: commitData.authorUserId ?? commitData?.userId,
        timestamp: commitData.timestamp,
        organizationId: repository?.organizationId,
        repositoryId: repository?.id,
      });

      const seenBinaries = new Set<string>();
      for (const binary of binaries) {
        if (!seenBinaries.has(binary)) {
          // insert binary_utilizations
          const bin = await binariesContext.getRepoBinaryByFilename(
            repository.id,
            binary
          );
          // if not, this will blow up the world
          if (bin) {
            await binaryCommitUtilizationsContext.create({
              commitSha: commitData.sha,
              commitId: insertedCommit.id,
              userId: commitData.userId,
              organizationId: repository?.organizationId ?? undefined,
              repositoryId: repository?.id,
              binaryId: bin.id,
              binaryHash: bin.sha,
              binaryFileName: bin.fileName,
            });
          }
          seenBinaries.add(binary);
        }
      }

      for (const {
        key: pluginName,
        value: pluginVersionNumber,
      } of state.plugins) {
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          pluginName,
          pluginVersionNumber
        );

        if (!pluginVersion) {
          return false;
        }

        const plugin = await pluginsContext.getByNameKey(pluginVersion.nameKey);
        if (!plugin) {
          return false;
        }
        const pluginId = plugin.id;
        const pluginVersionId = pluginVersion.id;
        const additions = Object.keys(
          commitData?.diff?.store?.[pluginName]?.add ?? {}
        ).length;
        const removals = Object.keys(
          commitData?.diff?.store?.[pluginName]?.remove ?? {}
        ).length;
        const byteSize = sizeof(state.store[pluginName]);
        await pluginCommitUtilizationsContext.create({
          commitSha: commitData.sha,
          commitId: insertedCommit.id,
          userId: commitData.userId,
          organizationId: repository?.organizationId ?? undefined,
          repositoryId: repository?.id,
          pluginId,
          pluginVersionId,
          pluginName,
          pluginVersionNumber,
          additions,
          removals,
          byteSize,
        });
      }
    return true;
  }
}
