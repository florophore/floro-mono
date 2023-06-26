import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Repository, SessionFragment } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiResponse, Branch, BranchesMetaState, CloneFile, FetchInfo, SourceGraphResponse } from "floro/dist/src/repo";
import { SourceCommitNode } from "floro/dist/src/sourcegraph";
import { Manifest } from "floro/dist/src/plugins";

export interface ClientSourceGraph {
  pointers: { [sha: string]: SourceCommitNode };
  rootNodes: Array<SourceCommitNode>;
  branches: Array<Branch>;
  branchesMetaState: BranchesMetaState;
}

export const useFloroServerSessionQuery = () => {
  return useQuery(
    "user-session",
    async (): Promise<SessionFragment|null> => {
      try {
        const result = await axios.get(
          `http://localhost:63403/session`
        );
        return result?.data ?? null;
      } catch (e) {
        return null;
      }
    },
    {
        cacheTime: 0,
        enabled: false
    }
  );
};

