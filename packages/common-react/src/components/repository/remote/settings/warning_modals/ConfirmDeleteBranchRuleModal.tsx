
import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../../../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import {
  PluginVersion,
  Plugin,
  useReleaseOrgPluginMutation,
  useReleaseUserPluginMutation,
  useChangeDefaultBranchMutation,
  ProtectedBranchRule,
  useDeleteBranchRuleMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import TealHexagonWarningLight from "@floro/common-assets/assets/images/icons/teal_hexagon_warning.light.svg";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { Branch } from "floro/dist/src/repo";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WarningIcon = styled.img`
  height: 96px;
  width: 96px;
`;

const VersionText = styled.h6`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.releaseTextColor};
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.promptText};
`;

const IncompatibleVersion = styled.p`
  padding: 0;
  margin: 8px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.warningTextColor};
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export interface Props {
  onDismiss: () => void;
  onSuccess: () => void;
  show?: boolean;
  repository: Repository;
  protectedBranchRule: ProtectedBranchRule|undefined;
}

const ConfirmDeleteBranchRuleModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const [deleteBranchRule, deleteBranchRuleMutation] = useDeleteBranchRuleMutation();

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"change default branch"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const onChange = useCallback(() => {
    if (!props.repository.id || !props?.protectedBranchRule?.id) {
      return;
    }
    deleteBranchRule({
      variables: {
        repositoryId: props?.repository?.id,
        protectedBranchRuleId: props?.protectedBranchRule?.id,
      },
    });
  }, [props.repository.id, props?.protectedBranchRule?.id]);

  useEffect(() => {
    if (deleteBranchRuleMutation?.data?.deleteBranchRule?.__typename == "DeleteBranchRuleSuccess") {
      props?.onSuccess();
    }
  }, [props?.onSuccess, deleteBranchRuleMutation?.data?.deleteBranchRule])

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
          <WarningIcon src={icon} />
          <PromptText>
            {`Are you sure you want to delete the branch rule for ${props.protectedBranchRule?.branchName}?`}
          </PromptText>
          <PromptText>
            {"This may affect repository access and impact production systems."}
          </PromptText>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            label={'confirm'}
            bg={"purple"}
            size={"medium"}
            onClick={onChange}
            isLoading={deleteBranchRuleMutation.loading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmDeleteBranchRuleModal);