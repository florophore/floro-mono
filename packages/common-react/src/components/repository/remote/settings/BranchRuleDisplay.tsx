
import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useSession } from "../../../../session/session-context";
import DisableDirectPushingSettings from "./branch_settings_boxes/DisableDirectPushingSettings";
import RequireApprovalToMergeSettings from "./branch_settings_boxes/RequireApprovalToMergeSettings";
import AutomaticallyDeleteMergedFeatureBranchesSettings from "./branch_settings_boxes/AutomaticallyDeleteMergedFeatureBranchesSettings";
import CanCreateMergeRequestSetting from "./branch_settings_boxes/CanCreateMergeRequestSetting";
import CanApproveMergeRequestSetting from "./branch_settings_boxes/CanApproveMergeRequestSetting";
import WithApprovalCanMergetSetting from "./branch_settings_boxes/WithApprovalCanMergeSetting";
import CanRevertSetting from "./branch_settings_boxes/CanRevertSetting";
import CanFixForwardSetting from "./branch_settings_boxes/CanFixForwardSetting";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SubTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-top: 8px;
`;

const InsufficientPermssionsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const InsufficientPermssionsTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const InsufficientPermssionsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  plugin: string;
  isLoading?: boolean;
}

const BranchRuleDisplay = (props: Props) => {
  const isUserPrivateRepo = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
        return props?.repository?.isPrivate;
    }
    return false;
  }, [props?.repository])

  const showAnySettings = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
      if (props?.repository?.isPrivate) {
        return false;
      }
      return props?.repository?.allowExternalUsersToPush;
    }
    return true;
  }, [props?.repository])

  if (!props?.repository?.repoPermissions?.canChangeSettings) {
    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <InsufficientPermssionsText>
            {props.isLoading && (
              <DotsLoader size={"medium"} color={"purple"}/>
            )}
            {!props.isLoading && (
              <>
                {"insufficient repo access to display branch rule controls"}
              </>
            )}
          </InsufficientPermssionsText>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }

  return (
    <Container>
      <InnerContainer>
        <TitleContainer>
          <div>
            <Title>{"Branch Rule Settings"}</Title>
            <SubTitle>
              <span style={{ fontWeight: 600 }}>{"Branch: "}</span>
              <span>{props?.repository?.protectedBranchRule?.branchName}</span>
            </SubTitle>
          </div>
        </TitleContainer>
        <DisableDirectPushingSettings repository={props.repository} />
        {!isUserPrivateRepo && (
          <RequireApprovalToMergeSettings repository={props.repository}/>
        )}
        <AutomaticallyDeleteMergedFeatureBranchesSettings repository={props.repository}/>
        {showAnySettings && (
          <CanCreateMergeRequestSetting repository={props.repository}/>
        )}
        {showAnySettings && (
          <CanApproveMergeRequestSetting repository={props.repository}/>
        )}
        {showAnySettings && (
          <WithApprovalCanMergetSetting repository={props.repository}/>
        )}
        {showAnySettings && (
          <CanRevertSetting repository={props.repository}/>
        )}
        {showAnySettings && (
          <CanFixForwardSetting repository={props.repository}/>
        )}
      </InnerContainer>
    </Container>
  );
};

export default React.memo(BranchRuleDisplay);