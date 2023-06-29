import React, { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSearchParams } from "react-router-dom";
import LocalSideNavigator from "./local/LocalSideNavigator";
import RemoteSideNavigator from "./remote/RemoteSideNavigator";
import { ComparisonState, RemoteCommitState } from "./remote/hooks/remote-state";
import { RepoPage } from "./types";

interface Props {
  repository: Repository;
  plugin: string;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  page: RepoPage;
}

const RepoSideNavigator = (props: Props): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const from: "remote"|"local" = searchParams.get?.('from') as "remote"|"local" ?? "remote";

  if (from == "local") {
    return (
      <LocalSideNavigator plugin={props.plugin} repository={props.repository} page={props.page}/>
    )
  }
  // add if logic here
  return (
    <RemoteSideNavigator
      remoteCommitState={props.remoteCommitState}
      comparisonState={props.comparisonState}
      plugin={props.plugin}
      repository={props.repository}
      page={props.page}
    />
  );
};

export default React.memo(RepoSideNavigator);