
import { BranchesMetaState, RepoState } from "floro/dist/src/repo";
import { SourceCommitNode } from "floro/dist/src/sourcegraph";

export class SourceGraph {

    private roots: Array<SourceCommitNode> = [];
    private pointers: {[sha: string]: SourceCommitNode} = {};
    private commits: Array<SourceCommitNode>;
    private branchesMetaState: BranchesMetaState;
    private repoState?: RepoState;

    constructor(
        commits: Array<SourceCommitNode>,
        branchesMetaState: BranchesMetaState,
        repoState?: RepoState,
    ) {
        this.commits = commits;
        this.branchesMetaState = branchesMetaState;
        this.repoState = repoState;
        this.buildGraph();
    }

    private buildGraph() {
        const commits = this.commits.sort(
          (a, b) => {
            return a.idx - b.idx;
          }
        );
        this.roots = commits.filter(v => v.idx == 0);
        for (const commit of commits) {
            if (commit.sha) {
                this.pointers[commit.sha] = commit;
            }
        }
        for (const commit of commits) {
            if (commit.idx == 0) {
                continue;
            }

            if (commit.sha && commit.parent) {
                if (!this.pointers[commit.sha]?.children?.includes(commit)) {
                    this.pointers?.[commit.parent]?.children?.push(commit);
                }
            }
        }
        for (const branch of this.branchesMetaState.allBranches) {
            if (branch.lastLocalCommit) {

                let node = this.pointers[branch.lastLocalCommit];
                if (!node) {
                    continue;
                }
                if (!node?.branchIds) {
                    node.branchIds = [];
                }
                node.branchIds.push(branch.branchId);
                node.isInBranchLineage = true;
                for (let i = node.idx -1; i >= 0; i--) {
                    if (node.parent) {
                        node = this.pointers[node.parent];
                        node.isInBranchLineage = true;
                        node.branchIds?.push(branch.branchId);
                    }
                }
            }
        }

        for (const branch of this.branchesMetaState.userBranches) {
            if (branch.lastLocalCommit) {
                let node = this.pointers[branch.lastLocalCommit];
                if (!node) {
                    continue;
                }
                node.isInUserBranchLineage = true;
                for (let i = node.idx -1; i >= 0; i--) {
                    if (node.parent) {
                        node = this.pointers[node.parent];
                        node.isInUserBranchLineage = true;
                    }
                }
            }
        }
        if (this?.repoState?.commit) {
            const currentNode = this.pointers[this.repoState.commit];
            currentNode.isCurrent = true;
        }
    }

    public getGraph(): Array<SourceCommitNode> {
        return this.roots;
    }

    public getPointers(): {[sha: string]: SourceCommitNode} {
        return this.pointers;
    }

}