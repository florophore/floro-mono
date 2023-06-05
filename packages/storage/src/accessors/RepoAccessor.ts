import { Repository } from '@floro/database/src/entities/Repository';
import { injectable, inject } from 'inversify';
import path from 'path';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import { Readable } from 'stream';
import {
  CommitData,
} from "floro/dist/src/sequenceoperations";
import { ApplicationKVState } from 'floro/dist/src/repo';

@injectable()
export default class RepoAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.privateDriver;
  }

  public getRelativeParentRootDirectory(repo: Repository) {
    if (repo.repoType == "user_repo") {
      return path.join("users", repo.userId);
    }
    return path.join(
      "orgs",
      repo.organizationId
    );
  }

  public parentRootDirectory(repo: Repository) {
    return path.join(
      this.driver.staticRoot?.() ?? "",
      this.getRelativeParentRootDirectory(repo)
    );
  }

  public async makeRepoPath(repo: Repository) {
    const repoPath = this.getRepoPath(repo);
    const exists = await this.driver.exists(repoPath);
    if (!exists) {
      await this.driver.mkdir(repoPath);
    }
  }

  public getRepoPath(repo: Repository): string {
    return path.join(
      this.parentRootDirectory(repo),
      "repos",
      repo.id
    );
  }

  public getRelativeRepoPath(repo: Repository): string {
    return path.join(
      this.getRelativeParentRootDirectory(repo),
      "repos",
      repo.id
    );
  }

  public getRelativeCommitPath(repo: Repository, sha: string) {
    return path.join(
      this.getRelativeParentRootDirectory(repo),
      "commits",
      sha + ".json"
    );
  }

  public getRelativeCommitKVPath(repo: Repository, sha: string) {
    return path.join(
      this.getRelativeParentRootDirectory(repo),
      "kvs",
      sha + ".json"
    );
  }
  public getRelativeCommitStatePath(repo: Repository, sha: string) {
    return path.join(
      this.getRelativeParentRootDirectory(repo),
      "states",
      sha + ".json"
    );
  }

  public getCommitPath(repo: Repository, sha: string) {
    return path.join(
      this.getRepoPath(repo),
      "commits",
      sha + ".json"
    );
  }
  public getCommitKVStatePath(repo: Repository, sha: string) {
    return path.join(
      this.getRepoPath(repo),
      "kvs",
      sha + ".json"
    );
  }
  public getCommitStatePath(repo: Repository, sha: string) {
    return path.join(
      this.getRepoPath(repo),
      "states",
      sha + ".json"
    );
  }

  public async writeCommit(repo: Repository, commitData: CommitData): Promise<boolean> {
    if (!commitData?.sha) {
      return false;
    }
    const commitPath = this.getCommitPath(repo, commitData.sha);
    await this.driver.write(commitPath, JSON.stringify(commitData, null, 2));
    return true;
  }

  public async readCommit(repo: Repository, sha: string): Promise<CommitData|null> {
    try {
      const commitPath = this.getCommitPath(repo, sha);
      const commitString = await this.driver.read(commitPath);
      return JSON.parse(commitString?.toString());
    } catch (e) {
      return null;
    }
  }

  public async writeCommitKV(repo: Repository, sha: string, commitKV: ApplicationKVState): Promise<boolean> {
    if (!sha || !commitKV) {
      return false;
    }

    const commitsKvsPath = path.join(
      this.getRepoPath(repo),
      "kvs"
    );
    const existsDir = await this.driver.exists(commitsKvsPath);
    if (!existsDir) {
      this.driver.mkdir(commitsKvsPath)
    }
    const kvPath = this.getCommitKVStatePath(repo, sha);
    await this.driver.write(kvPath, JSON.stringify(commitKV, null, 2));
    return true;
  }

  public async readCommitKV(repo: Repository, sha: string): Promise<ApplicationKVState|null> {
    try {
      const kvPath = this.getCommitKVStatePath(repo, sha);
      const kvString = await this.driver.read(kvPath);
      return JSON.parse(kvString?.toString());
    } catch (e) {
      return null;
    }
  }

  public async writeCommitState(repo: Repository, sha: string, commitState: object): Promise<boolean> {
    if (!sha || !commitState) {
      return false;
    }
    const commitsStatePath = path.join(
      this.getRepoPath(repo),
      "states"
    );
    const existsDir = await this.driver.exists(commitsStatePath);
    if (!existsDir) {
      this.driver.mkdir(commitsStatePath)
    }
    const statePath = this.getCommitStatePath(repo, sha);
    await this.driver.write(statePath, JSON.stringify(commitState, null, 2));
    return true;
  }

  public async readCommitState(repo: Repository, sha: string): Promise<object|null> {
    try {
      const statePath = this.getCommitStatePath(repo, sha);
      const stateString = await this.driver.read(statePath);
      return JSON.parse(stateString?.toString());
    } catch (e) {
      return null;
    }
  }


  public async getRepoZip(repo: Repository): Promise<Readable> {
    const path = this.getRepoPath(repo);
    return await this.driver.zipDirectory(path);
  }

  public async initInitialRepoFoldersAndFiles(repo: Repository) {
    await this.makeRepoPath(repo);
    const commitsDirPath = path.join(
      this.getRepoPath(repo),
      "commits"
    );
    const commitsKvsPath = path.join(
      this.getRepoPath(repo),
      "kvs"
    );
    const commitsStatesDirPath = path.join(
      this.getRepoPath(repo),
      "states"
    );
    const currentJsonPath = path.join(
      this.getRepoPath(repo),
      "current.json"
    );
    await Promise.all([
      this.driver.mkdir(commitsDirPath),
      this.driver.mkdir(commitsKvsPath),
      this.driver.mkdir(commitsStatesDirPath),
    ]);
    await Promise.all([
      this.driver.write(
        currentJsonPath,
        Buffer.from(
          JSON.stringify({
            branch: "main",
            commandMode: "view",
            commit: null,
            isInMergeConflict: false,
            merge: null,
            comparison: null,
          })
        )
      )
    ]);
  }
}