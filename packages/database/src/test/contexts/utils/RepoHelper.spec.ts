import { expect } from "chai";
import RepoHelper from "../../../contexts/utils/RepoHelper";

describe("RepoHelper", () => {
  describe("getRepoHashUUID", () => {
    it("generates uuid hashes", () => {
      const handle1 = "floro";
      const handle2 = "floroz";
      const repoName1 = "test-repo";
      const repoName2 = "test-repo2";
      const uuid1 = RepoHelper.getRepoHashUUID(handle1, repoName1);
      const uuid2 = RepoHelper.getRepoHashUUID(handle2, repoName1);
      const uuid3 = RepoHelper.getRepoHashUUID(handle1, repoName2);
      expect(Array.from(new Set([uuid1, uuid2, uuid3]))).to.have.lengthOf(3);
      for (const uuid of [uuid1, uuid2, uuid3]) {
        expect(uuid).to.have.lengthOf(36);
      }
    });
  });
});
