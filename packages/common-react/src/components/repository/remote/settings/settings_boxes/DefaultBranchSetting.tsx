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
  ProtectedBranchRule,
  RepoBranch,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import ColorPalette from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useRepoLinkBase } from "../../hooks/remote-hooks";
import ConfirmDefaultBranchChangeModal from "../warning_modals/ConfirmDefaultBranchChangeModal";

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
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

interface Props {
  repository: Repository;
}

const DefaultBranchSetting = (props: Props) => {
  const defaultBranch = useMemo(() => {
    return props.repository?.repoBranches?.find(
      (b) => b?.id == props.repository?.defaultBranchId
    );
  }, [
    props.repository?.repoBranches,
    props.repository?.defaultBranchId,
  ]);

  const [selectedBranch, setSelectedBranch] = useState<Branch>();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const onShowConfirmModal = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const onHideConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const onChangeBranch = useCallback((branch: Branch | null) => {
    if (branch) {
      setSelectedBranch(branch);
    }
  }, []);

  useEffect(() => {
    if (defaultBranch) {
      setSelectedBranch(defaultBranch as Branch);
    }
  }, [defaultBranch]);

  const possibleBranches = useMemo(() => {
    return props.repository?.repoBranches?.filter((branch) => {
      return !branch?.baseBranchId;
    });
  }, [props.repository?.repoBranches]);

  return (
    <>
      <ConfirmDefaultBranchChangeModal
        repository={props.repository}
        selectedDefaultBranch={selectedBranch}
        onDismiss={onHideConfirmModal}
        onSuccess={onHideConfirmModal}
        show={showConfirmModal}
      />
      <Container>
        <Title>{"Default Branch"}</Title>
        <SubTitle>
          {
            'Your default branch is the branch displayed by default when viewing your repository remotely. Your default branch should be considered a "merge only" branch. Your default branch cannot have a base branch. Changing the default branch may affect contributors\' ability to push commits, delete branches, revert changes, as well as merge open merge requests.'
          }
        </SubTitle>
        <BottomContainer style={{ marginTop: 12 }}>
          <BranchSelector
            size={"mid"}
            branch={(selectedBranch as Branch) ?? null}
            branches={(possibleBranches ?? []) as Branch[]}
            onChangeBranch={onChangeBranch}
          />
          {defaultBranch?.id != selectedBranch?.id && (
            <Button onClick={onShowConfirmModal} label={"change default"} bg={"purple"} size={"medium"} />
          )}
        </BottomContainer>
      </Container>
    </>
  );
};

export default React.memo(DefaultBranchSetting);
