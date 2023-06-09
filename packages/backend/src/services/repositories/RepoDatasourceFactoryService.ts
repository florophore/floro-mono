import { injectable, inject } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import { Commit } from "@floro/database/src/entities/Commit";
import {
  Branch as FloroBranch,
  ApplicationKVState,
  RepoState,
  CommitHistory,
} from "floro/dist/src/repo";
import { DataSource, makeDataSource } from "floro/dist/src/datasource";
import { CommitData } from "floro/dist/src/sequenceoperations";
import { PluginVersion } from "@floro/database/src/entities/PluginVersion";
import { Manifest } from "floro/dist/src/plugins";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import { SourceCommitNode } from "floro/dist/src/sourcegraph";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";

@injectable()
export default class RepositoryDatasourceFactoryService {
  private contextFactory!: ContextFactory;
  private repoAccessor!: RepoAccessor;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor
  ) {
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
  }

  public async getRevertOrAutofixPluginList(
    repository: Repository,
    branch: FloroBranch,
    commits: Array<Commit>,
    revertSha: string
  ) {
    const commitMap: { [sha: string]: Commit } = {};
    for (const commit of commits) {
      if (commit.sha) {
        commitMap[commit.sha] = commit;
      }
    }
    const revertCommit = commitMap[revertSha];
    if (!revertCommit) {
      return [];
    }
    const shas = revertCommit.parent
      ? [
          ...(branch.lastCommit ? [branch.lastCommit] : []),
          revertCommit.sha,
          revertCommit.parent,
        ]
      : branch.lastCommit
      ? [branch.lastCommit]
      : [];

    const pluginUtiltizationContext = await this.contextFactory.createContext(
      PluginCommitUtilizationsContext
    );
    const pluginVersionContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );
    const seenPluginVerions: Array<string> = [];
    for (const sha of shas) {
      if (sha) {
        const utilizations = await pluginUtiltizationContext.getAllByRepoAndSha(
            repository?.id,
            sha
        );
        for (const utilization of utilizations) {
            if (!seenPluginVerions.includes(utilization.pluginVersionId)) {
            seenPluginVerions.push(utilization.pluginVersionId);
            }
        }
      }
    }
    return pluginVersionContext.getByIds(seenPluginVerions);
  }

  public async getMergePluginList(
    repository: Repository,
    branch: FloroBranch,
    commits: Array<Commit>,
    mergeSha: string
  ) {
    const commitMap: { [sha: string]: Commit } = {};
    for (const commit of commits) {
      if (commit.sha) {
        commitMap[commit.sha] = commit;
      }
    }
    const mergeCommit = commitMap[mergeSha];
    if (!mergeCommit) {
      return [];
    }
    const shas = branch.lastCommit ? [branch.lastCommit, mergeSha] : [mergeSha];
    const pluginUtiltizationContext = await this.contextFactory.createContext(
      PluginCommitUtilizationsContext
    );
    const pluginVersionContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );
    const seenPluginVerions: Array<string> = [];
    for (const sha of shas) {
      if (sha) {
        const utilizations = await pluginUtiltizationContext.getAllByRepoAndSha(
            repository?.id,
            sha
        );
        for (const utilization of utilizations) {
            if (!seenPluginVerions.includes(utilization.pluginVersionId)) {
            seenPluginVerions.push(utilization.pluginVersionId);
            }
        }
      }
    }
    return pluginVersionContext.getByIds(seenPluginVerions);
  }

  public async getPluginList(
    repositoryId: string,
    sha: string
  ) {
    const pluginUtiltizationContext = await this.contextFactory.createContext(
      PluginCommitUtilizationsContext
    );
    const pluginVersionContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );
    const seenPluginVerions: Array<string> = [];
    if (sha) {
      const utilizations = await pluginUtiltizationContext.getAllByRepoAndSha(
          repositoryId,
          sha
      );
      for (const utilization of utilizations) {
          if (!seenPluginVerions.includes(utilization.pluginVersionId)) {
          seenPluginVerions.push(utilization.pluginVersionId);
          }
      }
    }
    return pluginVersionContext.getByIds(seenPluginVerions);
  }

  public async getDatasource(
    repository: Repository,
    branch: FloroBranch,
    commits: Array<Commit>,
    pluginVersions: Array<PluginVersion>
  ): Promise<DataSource> {
    const pluginMap: { [pluginVersionName: string]: Manifest } = {};
    const commitMap: { [sha: string]: Commit } = {};
    for (const commit of commits) {
      if (commit.sha) {
        commitMap[commit.sha] = commit;
      }
    }
    for (const pluginVersion of pluginVersions) {
      pluginMap[pluginVersion.name + ":" + pluginVersion.version] = JSON.parse(
        pluginVersion?.manifest ?? ""
      );
    }
    const memoizedCommitData = {};
    const memoizedCommitKV = {};
    const memoizedCommitHistory = {};

    const pluginsContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );

    const repoState: RepoState = {
      branch: branch.id,
      commit: branch.lastCommit,
      isInMergeConflict: false,
      merge: null,
      commandMode: "view",
      comparison: null,
    };
    return makeDataSource({
      readCurrentRepoState: async (): Promise<RepoState> => {
        return repoState;
      },
      readCommitHistory: async (
        _repoId: string,
        sha: string
      ): Promise<Array<CommitHistory>> => {
        if (memoizedCommitHistory[sha]) {
          return memoizedCommitHistory[sha];
        }
        const commitHistory = this.getCommitHistory(
          commits,
          sha
        );
        memoizedCommitHistory[sha] = commitHistory;
        return commitHistory as CommitHistory[];
      },
      readCommitApplicationState: async (
        _repoId: string,
        sha: string
      ): Promise<ApplicationKVState> => {
        if (memoizedCommitKV[sha]) {
          return memoizedCommitKV[sha];
        }
        const commitKV = await this.repoAccessor.readCommitKV(repository, sha);
        memoizedCommitKV[sha] = commitKV;
        return memoizedCommitKV[sha];
      },
      readCommit: async (_repoId: string, sha: string): Promise<CommitData> => {
        if (memoizedCommitData[sha]) {
          return memoizedCommitData[sha];
        }
        const commitData = await this.repoAccessor.readCommit(repository, sha);
        memoizedCommitData[sha] = commitData;
        return memoizedCommitData[sha];
      },
      readCommits: async (): Promise<Array<SourceCommitNode>> => {
        return commits as Array<SourceCommitNode>;
      },
      readCheckpoint: async (
        _repoId: string,
        sha: string
      ): Promise<ApplicationKVState> => {
        if (memoizedCommitKV[sha]) {
          return memoizedCommitKV[sha];
        }
        const commitKV = await this.repoAccessor.readCommitKV(repository, sha);
        memoizedCommitKV[sha] = commitKV;
        return memoizedCommitKV[sha];
      },
      getPluginManifest: async (
        pluginName,
        pluginVersion
      ): Promise<Manifest> => {
        const pluginVersionName = pluginName + ":" + pluginVersion;
        if (pluginMap[pluginVersionName]) {
          return pluginMap[pluginVersionName];
        }
        const dbPluginVersion = await pluginsContext.getByNameAndVersion(
          pluginName,
          pluginVersion
        );
        if (dbPluginVersion) {
          pluginMap[pluginVersionName] = JSON.parse(
            dbPluginVersion?.manifest ?? ""
          );
          return pluginMap[pluginVersionName];
        }
        return null as any;
      },
      saveCheckpoint: async () => {
        return null;
      },
      readHotCheckpoint: async (): Promise<null> => {
        return null;
      },
      saveHotCheckpoint: async (): Promise<null> => {
        return null;
      },
      checkBinary: async () => {
        return true;
      },
    });
  }

  public getCommitHistory(commits: Array<Commit>, sha: string) {
    const commitMap: { [sha: string]: Commit } = {};
    for (const commit of commits) {
      if (commit.sha) {
        commitMap[commit.sha] = commit;
      }
    }
    let currentSha = sha;
    let out: Array<Commit> = [];
    while (currentSha) {
      out.push(commitMap[currentSha]);
      currentSha = commitMap[currentSha].parent;
    }
    return out;
  }
}
