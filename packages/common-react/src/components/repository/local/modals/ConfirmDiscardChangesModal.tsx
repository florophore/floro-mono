import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import {
  PluginVersion,
  Plugin,
  useReleaseOrgPluginMutation,
  useReleaseUserPluginMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import TealHexagonWarningLight from "@floro/common-assets/assets/images/icons/teal_hexagon_warning.light.svg";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { useDiscardChanges } from "../hooks/local-hooks";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { useLocalVCSNavContext } from "../vcsnav/LocalVCSContext";

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
}

const ConfirmDiscardChangesModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"discard changes"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const discardChangesMutation = useDiscardChanges(props.repository);
  const { setIsStashing} = useLocalVCSNavContext();

  useEffect(() => {
    if (!props.show) {
      discardChangesMutation.reset();
    }
  }, [props.show])

  const onDiscard = useCallback(() => {
    discardChangesMutation.mutate();
    setIsStashing(true);
  }, []);

  useEffect(() => {
    if (discardChangesMutation.isSuccess) {
        props.onDismiss();
    }

  }, [discardChangesMutation.isSuccess, props.onDismiss]);

  useEffect(() => {
    if (discardChangesMutation.isSuccess || discardChangesMutation.isError) {
      setIsStashing(false);
    }
  }, [discardChangesMutation.isSuccess, discardChangesMutation.isError])

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
            {"Are you sure you want to discard your current changes?"}
          </PromptText>
          <PromptText>
            {"Discarded changes are irrecoverable."}
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
            onClick={onDiscard}
            isLoading={discardChangesMutation.isLoading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmDiscardChangesModal);
