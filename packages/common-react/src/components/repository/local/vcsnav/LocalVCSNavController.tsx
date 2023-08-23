import React from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useCurrentRepoState } from "../hooks/local-hooks";
import LocalVCSViewMode from "./LocalVCSViewMode";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import LocalBranchesNavPage from "./LocalBranchesNavPage";
import NewBranchNavPage from "./NewBranchNavPage";
import LocalVCSEditMode from "./LocalVCSEditMode";
import LocalVCSCompareMode from "./LocalVCSCompareMode";
import WriteCommitNavPage from "./WriteCommitNavPage";
import EditBranchNavPage from "./EditBranchNavPage";
import LocalVCSCompareMergeMode from "./LocalVCSCompareMergeMode";
import SourceGraphNav from "./SourceGraphNav";
import LocalSettingsVCSPage from "./LocalSettingsVCSPage";

interface Props {
  repository: Repository;
  plugin: string;
}

const LocalVCSNavController = (props: Props) => {

  const { data } = useCurrentRepoState(props.repository);
  const { subAction, showLocalSettings} = useLocalVCSNavContext();

  if (showLocalSettings) {
    return <LocalSettingsVCSPage repository={props.repository}/>;
  }
  if (data) {
    if (subAction == "branches") {
        return <LocalBranchesNavPage apiResponse={data} repository={props.repository}/>
    }
    if (subAction == "new_branch") {
      return <NewBranchNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "edit_branch") {
      return <EditBranchNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "write_commit") {
      return <WriteCommitNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "source_graph") {
      return <SourceGraphNav apiResponse={data} repository={props.repository}/>
    }
  }
  if (data?.repoState.commandMode == "view") {

    return <LocalVCSViewMode apiResponse={data} repository={props.repository} plugin={props.plugin}/>;
  }

  if (data?.repoState.commandMode == "compare") {
    if (data?.repoState?.comparison?.against == "merge") {
    return <LocalVCSCompareMergeMode apiResponse={data} repository={props.repository} />;
    }
    return <LocalVCSCompareMode apiResponse={data} repository={props.repository} />;
  }

  if (data?.repoState.commandMode == "edit") {
    return <LocalVCSEditMode apiResponse={data} repository={props.repository} plugin={props.plugin} />;
  }
  return null;
};

export default React.memo(LocalVCSNavController);