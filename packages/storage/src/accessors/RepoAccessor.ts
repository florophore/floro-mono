import { Repository } from '@floro/database/src/entities/Repository';
import { injectable, inject } from 'inversify';
import path from 'path';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import { Pack } from 'tar';
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
    const pluginsJsonPath = path.join(
      this.getRepoPath(repo),
      "plugins.json"
    );
    const commitsJsonPath = path.join(
      this.getRepoPath(repo),
      "commits.json"
    );
    const branchesJsonPath = path.join(
      this.getRepoPath(repo),
      "branches.json"
    );
    const commitsDirPath = path.join(
      this.getRepoPath(repo),
      "commits"
    );
    const binariesDirPath = path.join(
      this.getRepoPath(repo),
      "binaries"
    );
    await Promise.all([
      this.driver.write(pluginsJsonPath, Buffer.from(JSON.stringify({}))),
      this.driver.write(commitsJsonPath, Buffer.from(JSON.stringify({}))),
      this.driver.write(
        branchesJsonPath,
        Buffer.from(JSON.stringify({ main: null }))
      ),
      this.driver.mkdir(commitsDirPath),
      this.driver.mkdir(binariesDirPath),
    ]);
  }
}