
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
  useCreateBranchRuleMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import TealHexagonWarningLight from "@floro/common-assets/assets/images/icons/teal_hexagon_warning.light.svg";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { Branch } from "floro/dist/src/repo";
import BranchRuleSelector from "@floro/storybook/stories/repo-components/BranchRuleSelector";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";

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

const InstructionsText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  text-align: center;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

export interface Props {
  onDismiss: () => void;
  onSuccess: (protectedBranchRule: ProtectedBranchRule) => void;
  show?: boolean;
  repository: Repository;
}

const CreateBranchRuleModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);


  const branchRuleBranchIds = useMemo(() => {
    return new Set(props?.repository?.protectedBranchRules?.map(br => br?.branchId));
  }, [props?.repository?.protectedBranchRules]);

  const branchesWithoutBranchRules = useMemo((): Array<Branch> => {
    return props?.repository?.repoBranches?.filter(b => {
      return !branchRuleBranchIds.has(b?.id as string);
    }) as Array<Branch> ?? ([] as Array<Branch>);
  }, [props?.repository?.repoBranches, branchRuleBranchIds]);

  const [selectedBranch, setSelectedBranch] = useState(branchesWithoutBranchRules[0]);

  useEffect(() => {
    if (props.show) {
      setSelectedBranch(branchesWithoutBranchRules[0]);
    }

  }, [props.show])

  const [createBranchRule, createBranchRuleMutation] = useCreateBranchRuleMutation();

  const onChangeBranch = useCallback((branch: Branch|null) => {
    if (branch) {
      setSelectedBranch(branch);
    }

  }, []);

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"create branch rule"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const onChange = useCallback(() => {
    if (!props.repository.id || !selectedBranch?.id) {
      return;
    }
    createBranchRule({
      variables: {
        repositoryId: props?.repository?.id,
        branchId: selectedBranch?.id
      },
    });
  }, [props.repository.id, selectedBranch]);

  useEffect(() => {
    if (createBranchRuleMutation?.data?.createBranchRule?.__typename == "CreateBranchRuleSuccess") {
      if (createBranchRuleMutation?.data?.createBranchRule?.protectedBranchRule) {
        props?.onSuccess(createBranchRuleMutation?.data?.createBranchRule?.protectedBranchRule);
      }
    }
  }, [props?.onSuccess, createBranchRuleMutation?.data?.createBranchRule])

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
          <BranchSelector
            size="wide"
            branches={branchesWithoutBranchRules}
            branch={selectedBranch}
            onChangeBranch={onChangeBranch}
          />
          <div style={{ width: 468, display: "block", textAlign: "left" }}>
            <InstructionsText>
              {
                "Choose a branch to create a branch rule for. You will be able to configure the settings after."
              }
            </InstructionsText>
          </div>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            label={"create"}
            bg={"orange"}
            size={"medium"}
            onClick={onChange}
            isLoading={createBranchRuleMutation.loading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(CreateBranchRuleModal);