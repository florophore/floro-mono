
import React from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { RemoteCommitState } from "../hooks/remote-state";
import RemoteVCSNavHome from "./RemoteVCSNavHome";
import { useSearchParams} from 'react-router-dom';
import RemoteVCSBranchHistory from "./RemoteVCSBranchHistory";
import RemoteVCSCommitHistory from "./RemoteVCSCommitHistory";

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  plugin: string;
  page:
    | "history"
    | "home"
    | "settings"
    | "branch-rules"
    | "merge-requests"
    | "merge-request"
    | "merge-request-review";
}

const RemoteVCSNavController = (props: Props) => {
  const [searchParams] = useSearchParams();
  const sha = searchParams.get('sha');

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