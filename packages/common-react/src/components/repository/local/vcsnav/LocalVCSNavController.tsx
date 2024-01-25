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
import { useCurrentRepoState, usePluginStorageV2 } from "../hooks/local-hooks";

interface Props {
  repository: Repository;
  plugin: string;
  page: RepoPage;
}

const LocalVCSNavController = (props: Props) => {
  const { subAction, showLocalSettings } = useLocalVCSNavContext();
  const { data: repoData } = useCurrentRepoState(props.repository);
  const { data: storage } = usePluginStorageV2(props.repository);

  if (showLocalSettings) {
    return <LocalSettingsVCSPage repository={props.repository} />;
  }
  if (repoData) {
    if (subAction == "branches") {
      return (
        <LocalBranchesNavPage
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }
    if (subAction == "new_branch") {
      return (
        <NewBranchNavPage
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }

    if (subAction == "edit_branch") {
      return (
        <EditBranchNavPage
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }

    if (subAction == "write_commit") {
      return (
        <WriteCommitNavPage
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }

    if (subAction == "source_graph") {
      return (
        <SourceGraphNav
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }
  }
  if (repoData?.repoState.commandMode == "view" && storage) {
    return (
      <LocalVCSViewMode
        storage={storage}
        apiResponse={repoData}
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (repoData?.repoState.commandMode == "compare") {
    if (repoData?.repoState?.comparison?.against == "merge") {
      return (
        <LocalVCSCompareMergeMode
          apiResponse={repoData}
          repository={props.repository}
        />
      );
    }
    return (
      <LocalVCSCompareMode
        apiResponse={repoData}
        repository={props.repository}
      />
    );
  }

  if (repoData?.repoState.commandMode == "edit" && storage) {
    return (
      <LocalVCSEditMode
        storage={storage}
        apiResponse={repoData}
        repository={props.repository}
        plugin={props.plugin}
        page={props.page}
      />
    );
  }
  return null;
};

export default React.memo(LocalVCSNavController);
