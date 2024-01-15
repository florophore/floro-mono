import React from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
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
import { RepoPage } from "../../types";
import { ApiResponse } from "floro/dist/src/repo";

interface Props {
  repository: Repository;
  plugin: string;
  page: RepoPage;
  apiResponse?: ApiResponse|null;
  storage?: object|null;
}

const LocalVCSNavController = (props: Props) => {
  const { subAction, showLocalSettings } = useLocalVCSNavContext();

  if (showLocalSettings) {
    return <LocalSettingsVCSPage repository={props.repository} />;
  }
  if (props?.apiResponse) {
    if (subAction == "branches") {
      return (
        <LocalBranchesNavPage
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }
    if (subAction == "new_branch") {
      return (
        <NewBranchNavPage
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }

    if (subAction == "edit_branch") {
      return (
        <EditBranchNavPage
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }

    if (subAction == "write_commit") {
      return (
        <WriteCommitNavPage
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }

    if (subAction == "source_graph") {
      return (
        <SourceGraphNav
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }
  }
  if (props?.apiResponse?.repoState.commandMode == "view" && props?.storage) {
    return (
      <LocalVCSViewMode
        storage={props?.storage}
        apiResponse={props?.apiResponse}
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (props?.apiResponse?.repoState.commandMode == "compare") {
    if (props?.apiResponse?.repoState?.comparison?.against == "merge") {
      return (
        <LocalVCSCompareMergeMode
          apiResponse={props?.apiResponse}
          repository={props.repository}
        />
      );
    }
    return (
      <LocalVCSCompareMode
        apiResponse={props?.apiResponse}
        repository={props.repository}
      />
    );
  }

  if (props?.apiResponse?.repoState.commandMode == "edit" && props?.storage) {
    return (
      <LocalVCSEditMode
        storage={props?.storage}
        apiResponse={props?.apiResponse}
        repository={props.repository}
        plugin={props.plugin}
        page={props.page}
      />
    );
  }
  return null;
};

export default React.memo(LocalVCSNavController);
