
import React, { useMemo, useState, useCallback, useEffect } from "react";

import RootModal from "@floro/common-react/src/components/RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import SuccessLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import SuccessDark from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { ApiResponse } from "floro/dist/src/repo";
import { Organization, OrganizationInvitation, useCancelOrganizationInvitationMutation, useRejectOrganizationInvitationMutation, useReminderDownloadMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import Input from "@floro/storybook/stories/design-system/Input";
import EmailValidator from 'email-validator';
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";

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
  max-width: calc(100% - 16px);
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

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};


export interface Props {
  onDismiss: () => void;
  show?: boolean;
}

const MobileDownloadReminderModal = (props: Props) => {
  const theme = useTheme();
  const warningIcon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);
  const successIcon = useMemo(() => {
    return theme.name == "light"
      ? SuccessLight
      : SuccessDark;
  }, [theme.name]);
  const [email, setEmail] = useState("");
  const isEmailValid = useMemo(() => EmailValidator.validate(email), [email]);
  const icon = useIcon("front-page.floro-round");
  const sendReminderTitle = useRichText("installation.send_reminder");
  const sendReminderSubTitle = useRichText("installation.send_reminder_subtitle");
  const successSentReminder = useRichText("installation.sent_reminder_email", { email});
  const failedSentReminder = useRichText("installation.failed_reminder_email", { email});
  const enterEmail = usePlainText("installation.enter_email");

  const back = useRichText("installation.back");
  const retry = useRichText("installation.retry");
  const cancel = useRichText("installation.cancel");
  const send = useRichText("installation.send");
  const close = useRichText("installation.close");

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{sendReminderTitle}</HeaderTitle>
      </HeaderContainer>
    );
  }, [sendReminderTitle]);

  const [sendReminder, senderReminderResult] = useReminderDownloadMutation();

  useEffect(() => {
    if (props.show) {
      senderReminderResult.reset();
    }
  }, [props.show]);

  const onSend = useCallback(() => {
    if (!email || !EmailValidator.validate(email)) {
      return;
    }
    sendReminder({
      variables: {
        email,
      },
    });
  }, [email]);

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        {(senderReminderResult?.data?.reminderToDownload?.type == "SENT") && (
          <>
            <TopContentContainer>
              <WarningIcon src={successIcon} />
              <PromptText>
                {successSentReminder}
              </PromptText>
            </TopContentContainer>
            <BottomContentContainer style={{justifyContent: "center", alignItems: "center"}}>
              <Button
                onClick={props.onDismiss}
                label={close}
                bg={"purple"}
                size={"extra-big"}
              />
            </BottomContentContainer>
          </>

        )}
        {(senderReminderResult?.data?.reminderToDownload?.type == "ERROR") && (
          <>
            <TopContentContainer>
              <WarningIcon src={warningIcon} />
              <PromptText>
                {failedSentReminder}
              </PromptText>
            </TopContentContainer>
            <BottomContentContainer>
              <Button
                onClick={() => {
                  senderReminderResult.reset();
                }}
                label={back}
                bg={"gray"}
                size={"medium"}
              />
              <Button
                onClick={onSend}
                isDisabled={email == "" || !EmailValidator.validate(email)}
                isLoading={senderReminderResult.loading}
                label={retry}
                bg={"purple"}
                size={"medium"}
              />
            </BottomContentContainer>
          </>

        )}
        {!senderReminderResult?.data && (
          <>
            <TopContentContainer>
              <WarningIcon src={icon} />
              <PromptText>
                {sendReminderSubTitle}
              </PromptText>
              <div style={{ marginTop: 24 }}>
                <Input
                  value={email}
                  label={enterEmail}
                  placeholder={enterEmail}
                  isValid={email == "" ? undefined : isEmailValid}
                  onTextChanged={setEmail}
                  type="email"
                />
              </div>
            </TopContentContainer>
            <BottomContentContainer>
              <Button
                onClick={props.onDismiss}
                label={cancel}
                bg={"gray"}
                size={"medium"}
              />
              <Button
                onClick={onSend}
                isDisabled={email == "" || !EmailValidator.validate(email)}
                isLoading={senderReminderResult.loading}
                label={send}
                bg={"teal"}
                size={"medium"}
              />
            </BottomContentContainer>
          </>
        )}
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(MobileDownloadReminderModal);