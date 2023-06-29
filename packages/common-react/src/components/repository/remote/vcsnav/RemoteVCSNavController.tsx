
import React from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ComparisonState, RemoteCommitState } from "../hooks/remote-state";
import RemoteVCSNavHome from "./RemoteVCSNavHome";
import { useSearchParams} from 'react-router-dom';
import RemoteVCSBranchHistory from "./RemoteVCSBranchHistory";
import RemoteVCSCommitHistory from "./RemoteVCSCommitHistory";
import RemoteVCSCreateMergeRequest from "./RemoteVCSCreateMergeRequest";
import { RepoPage } from "../../types";

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  plugin: string;
  page: RepoPage;
}

const RemoteVCSNavController = (props: Props) => {
  const [searchParams] = useSearchParams();
  const sha = searchParams.get('sha');
  const review = searchParams.get('review');

  if (props.page == "history") {
    if (!sha) {
      return (
        <RemoteVCSBranchHistory
          repository={props.repository}
          remoteCommitState={props.remoteCommitState}
          plugin={props.plugin}
          page={props.page}
        />
      );

    }
      return (
        <RemoteVCSCommitHistory
          repository={props.repository}
          remoteCommitState={props.remoteCommitState}
          plugin={props.plugin}
          page={props.page}
        />
      );
  }

  if (props.page == "merge-request-create") {
    return (
      <RemoteVCSCreateMergeRequest
        repository={props.repository}
        remoteCommitState={props.remoteCommitState}
        comparisonState={props.comparisonState}
        plugin={props.plugin}
      />
    );
  }

  return (
    <RemoteVCSNavHome
      repository={props.repository}
      plugin={props.plugin}
      page={props.page}
      remoteCommitState={props.remoteCommitState}
    />
  );
};

export default React.memo(RemoteVCSNavController);