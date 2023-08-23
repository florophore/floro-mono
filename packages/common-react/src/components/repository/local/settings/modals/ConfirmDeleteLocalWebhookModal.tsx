import React, { useMemo, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import RootModal from "@floro/common-react/src/components/RootModal";
import Button from "@floro/storybook/stories/design-system/Button";
import { RepoEnabledWebhookKey, WebhookKey } from "floro/dist/src/apikeys";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useTheme } from "@emotion/react";

import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { useDeleteEnabledWebhookKey } from "../enabled-key-hooks";
import { useCanAmend } from "../../hooks/local-hooks";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 470px;
`;

const WarningIcon = styled.img`
  height: 96px;
  width: 96px;
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

export interface Props {
  show: boolean;
  onDismissModal: () => void;
  webhookKey: WebhookKey;
  enabledWebhookKey: RepoEnabledWebhookKey;
  repository: Repository;
}

const ConfirmDeleteLocalWebhook = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const deleteMutation = useDeleteEnabledWebhookKey(props.repository?.id as string);

  const onDeleteKey = useCallback(() => {
    if (!props.enabledWebhookKey?.id) {
      return;
    }
    deleteMutation.mutate(props.enabledWebhookKey?.id as string);
  }, [props.enabledWebhookKey?.id])


  useEffect(() => {
    if (deleteMutation.isSuccess) {
      deleteMutation.reset();
      props.onDismissModal();
    }
  }, [deleteMutation.isSuccess])

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"delete local webhook"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <WarningIcon src={icon} />
          <PromptText>
            {`Are you sure you want to delete this webhook?`}
          </PromptText>
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              onClick={onDeleteKey}
              label={"delete webhook"}
              bg={"red"}
              size={"extra-big"}
              isLoading={deleteMutation.isLoading}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootModal>
  );
};

export default React.memo(ConfirmDeleteLocalWebhook);
