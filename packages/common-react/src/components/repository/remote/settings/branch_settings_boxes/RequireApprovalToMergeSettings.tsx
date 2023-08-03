import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  useUpdateAnyoneCanChangeSettingsMutation,
  RepoBranch,
  Repository,
  User,
  OrganizationRole,
  useUpdateDisableDirectPushingMutation,
  useUpdateRequireApprovalToMergeMutation,
  useUpdateRequireReapprovalOnPushToMergeMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import { ColorPalette } from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useRepoLinkBase } from "../../hooks/remote-hooks";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import AddSettingsUsersModal from "../setting_modals/AddSettingsUsersModal";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import AddSettingsRolesModal from "../setting_modals/AddSettingsRolesModal";

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 960px;
  padding: 16px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
`;

const Title = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const TitleSpan = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const SubTitle = styled.p`
  margin-top: 8px;
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const BottomContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

interface Props {
  repository: Repository;
}

const RequireApprovalToMergeSettings = (props: Props) => {
  const [requireApprovalToMerge, setRequireApprovalToMerge] =
    useState<boolean>(false);
  const [requireReapprovalOnPushToMerge, setRequireReapprovalOnPushToMerge] =
    useState<boolean>(false);
  const theme = useTheme();
  const [
    requireApprovalToMergeMutation,
    requireApprovalToMergeRequest,
  ] = useUpdateRequireApprovalToMergeMutation();

  const [
    requireReApprovalToMergeMutation,
    requireReApprovalToMergeRequest,
  ] = useUpdateRequireReapprovalOnPushToMergeMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setRequireApprovalToMerge(
      props.repository?.protectedBranchRule?.requireApprovalToMerge ?? false
    );
  }, [props.repository?.protectedBranchRule?.requireApprovalToMerge]);

  useEffect(() => {
    setRequireReapprovalOnPushToMerge(
      props.repository?.protectedBranchRule?.requireReapprovalOnPushToMerge ?? false
    );
  }, [props.repository?.protectedBranchRule?.requireReapprovalOnPushToMerge]);

  const onChangeRequireApproval = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setRequireApprovalToMerge(!requireApprovalToMerge);
      requireApprovalToMergeMutation({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          requireApprovalToMerge: !requireApprovalToMerge,
        },
      });
    }
  }, [requireApprovalToMerge, props.repository]);

  const onChangeReapproval = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setRequireReapprovalOnPushToMerge(!requireReapprovalOnPushToMerge);
      requireReApprovalToMergeMutation({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          requireReapprovalOnPushToMerge: !requireReapprovalOnPushToMerge,
        },
      });
    }
  }, [requireReapprovalOnPushToMerge, props.repository]);

  return (
    <Container>
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={requireApprovalToMerge}
            onChange={onChangeRequireApproval}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Require Approval To Merge Settings"}</Title>
            {requireApprovalToMergeRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Require all merge requests to get peer approval in order to merge. Note: Admins are always able to merge regardless of approval status."
            }
          </SubTitle>
        </RightContainer>
      </MainContainer>
      {props.repository?.protectedBranchRule?.requireApprovalToMerge && (
        <MainContainer style={{marginTop: 24}}>
          <LeftContainer>
            <Checkbox
              isChecked={requireReapprovalOnPushToMerge}
              onChange={onChangeReapproval}
            />
          </LeftContainer>
          <RightContainer>
            <TitleSpan>
              <Title>{"Require Re-Approval To Merge Branches After Push Updates"}</Title>
              {requireReApprovalToMergeRequest.loading && (
                <div style={{ marginLeft: 12 }}>
                  <DotsLoader color={loaderColor} size={"small"} />
                </div>
              )}
            </TitleSpan>
            <SubTitle>
              {
                "Only allow merge requests to be merged after receiving approval of the current branch sha."
              }
            </SubTitle>
          </RightContainer>
        </MainContainer>
      )}
    </Container>
  );
};

export default React.memo(RequireApprovalToMergeSettings);