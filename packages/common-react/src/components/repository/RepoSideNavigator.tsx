import React, { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSearchParams } from "react-router-dom";
import LocalSideNavigator from "./local/LocalSideNavigator";
import RemoteSideNavigator from "./remote/RemoteSideNavigator";

interface Props {
  repository: Repository;
  plugin: string;
}

const RepoSideNavigator = (props: Props): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const from: "remote"|"local" = searchParams.get?.('from') as "remote"|"local" ?? "remote";

  if (from == "local") {
    return (
      <LocalSideNavigator plugin={props.plugin} repository={props.repository}/>
    )
  }
  return (
      <RemoteSideNavigator plugin={props.plugin} repository={props.repository}/>
  );
};

export default React.memo(RepoSideNavigator);