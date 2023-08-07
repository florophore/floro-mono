

import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import {
  CommitState, RepoBranch, useAutofixCommitMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { useSearchParams } from "react-router-dom";

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
  show?: boolean;
  repository: Repository;
  branch: RepoBranch;
  commit: CommitState;
}

const ConfirmAutofixCommitModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const [searchParams] = useSearchParams();
  const sha = searchParams.get('sha');
  const searchQuery = searchParams.get('query');
  const idxString = searchParams.get('idx');
  const idx = useMemo(() => {
    try {
      if (!idxString) {
        return null;
      }
      const idxInt = parseInt(idxString);
      if (Number.isNaN(idxInt)) {
        return null
      }
      return idxInt;
    } catch(e) {
      return null;
    }
  }, [idxString]);

  const [autofix, auotfixMutation] = useAutofixCommitMutation();

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"fix forward commit"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const onAutofix = useCallback(() => {
    if (
      !props?.repository?.id ||
      !props?.repository?.branchState?.branchId ||
      !props.repository.branchState?.commitState?.sha
    ) {
      return;
    }
    autofix({
      variables: {
        repositoryId: props?.repository?.id,
        branchId: props?.repository?.branchState?.branchId,
        reversionSha: props.repository.branchState?.commitState?.sha,
        sha,
        searchQuery,
        idx,
      },
    });
  }, [
    props?.repository?.id,
    props?.repository?.branchState?.branchId,
    props.repository.branchState?.commitState,
    sha,
    searchQuery,
    idx,
  ]);

  useEffect(() => {
    if (auotfixMutation?.data?.autofixCommit?.__typename == "AutofixCommitSuccess") {
      props?.onDismiss();
    }
  }, [props?.onDismiss, auotfixMutation?.data?.autofixCommit])

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
            {`Are you sure you want to fix forward commit (${props?.commit?.sha?.substring(0, 6)}) on branch "${props?.branch?.name}"?`}
          </PromptText>
          <PromptText>
            {
              "Only changes from this commit will be removed from the branch. If you want to remove all subsequent changes, please consider reverting instead (if possible)."
            }
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
            label={"fix forward"}
            bg={"red"}
            size={"medium"}
            onClick={onAutofix}
            isLoading={auotfixMutation.loading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmAutofixCommitModal);