import React from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ComparisonState, RemoteCommitState, useMergeRequestReviewPage } from "../hooks/remote-state";
import RemoteVCSNavHome from "./RemoteVCSNavHome";
import { useSearchParams} from 'react-router-dom';
import RemoteVCSBranchHistory from "./RemoteVCSBranchHistory";
import RemoteVCSCommitHistory from "./RemoteVCSCommitHistory";
import RemoteVCSCreateMergeRequest from "./RemoteVCSCreateMergeRequest";
import { RepoPage } from "../../types";
import RemoteVCSMergeRequestsHistory from "./RemoteVCSMergeRequestsHistory";
import RemoteVCSMergeRequest from "./RemoteVCSMergeRequest";
import RemoteVCSSettings from "./RemoteVCSSettings";
import RemoteVCSBranchRuleSettings from "./RemoteVCSBranchRuleSettings";
import RemoteVCSConversation from "./RemoteVCSConversation";
import RemoteVCSApiSettings from "./RemoteVCSApiSettings";

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

  const { reviewPage } = useMergeRequestReviewPage();

  if (props.page == "settings") {
    return (
      <RemoteVCSSettings
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }
  if (props.page == "api-settings") {
    return (
      <RemoteVCSApiSettings
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (props.page == "branch-rule") {
    return (
      <RemoteVCSBranchRuleSettings
        repository={props.repository}
        plugin={props.plugin}
      />

    );
  }

  if (props.page == "merge-requests") {
    return (
      <RemoteVCSMergeRequestsHistory
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (props.page == "merge-request") {
    if (reviewPage == "changes") {
      return (
        <RemoteVCSConversation
          repository={props.repository}
          plugin={props.plugin}
        />
      );
    }
    return (
      <RemoteVCSMergeRequest
        repository={props.repository}
        remoteCommitState={props.remoteCommitState}
        plugin={props.plugin}
      />
    );
  }
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