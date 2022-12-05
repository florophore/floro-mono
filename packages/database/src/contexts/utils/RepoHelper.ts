import { createHash } from "crypto";

export default class RepoHelper {

    public static getRepoHashUUID(ownerHandle?: string, repoName?: string): string|null {
        if (!ownerHandle || !repoName) {
          return null;
        }
        const key = `${ownerHandle.toLowerCase().trim()}:${repoName.toLowerCase().trim()}`;
        const hash = createHash("sha256");
        hash.update(key);
        const sha256bytes = hash.digest();
        const bytes = sha256bytes.subarray(0, 16);
        const str = bytes.toString("hex");
        return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
    } 
}