import { Repository } from '@floro/database/src/entities/Repository';
import { injectable, inject } from 'inversify';
import path from 'path';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import { Readable } from 'stream';

@injectable()
export default class RepoAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.driver;
  }

  public parentRootDirectory(repo: Repository) {
    if (repo.repoType == "user_repo") {
      return path.join(this.driver.staticRoot?.() ?? "", "users", repo.userId);
    }
    return path.join(
      this.driver.staticRoot?.() ?? "",
      "orgs",
      repo.organizationId
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
    const subdirectory = repo.isPrivate ? "private" : "public";
    return path.join(
      this.parentRootDirectory(repo),
      "repos",
      subdirectory,
      repo.id
    );
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
    const branchesDirPath = path.join(
      this.getRepoPath(repo),
      "branches"
    );
    const binariesDirPath = path.join(
      this.getRepoPath(repo),
      "binaries"
    );
    const stashDirPath = path.join(
      this.getRepoPath(repo),
      "stashes"
    );
    const currentJsonPath = path.join(
      this.getRepoPath(repo),
      "current.json"
    );
    const settingsJsonPath = path.join(
      this.getRepoPath(repo),
      "settings.json"
    );
    const mainBranchJsonPath = path.join(
      branchesDirPath,
      "main.json"
    );
    await Promise.all([
      this.driver.mkdir(commitsDirPath),
      this.driver.mkdir(branchesDirPath),
      this.driver.mkdir(binariesDirPath),
      this.driver.mkdir(stashDirPath),
    ]);
    await Promise.all([
      this.driver.write(
        currentJsonPath,
        Buffer.from(
          JSON.stringify({
            branch: "main",
            commit: null,
            diff: {
              plugins: {
                add: {},
                remove: {},
              },
              store: {},
              binaries: {
                add: {},
                remove: {},
              },
            },
          })
        )
      ),
      this.driver.write(
        settingsJsonPath,
        Buffer.from(
          JSON.stringify({
            mainBranch: "main",
            init: {
              plugins: [],
              store: {},
              binaries: [],
            },
          })
        )
      ),
      this.driver.write(
        mainBranchJsonPath,
        Buffer.from(
          JSON.stringify({
            lastCommit: null,
            firstCommit: null,
            stashes: [],
            createdBy: repo.createdByUserId,
            createdAt: (new Date()).toString()
          })
        )
      ),
    ]);
  }
}