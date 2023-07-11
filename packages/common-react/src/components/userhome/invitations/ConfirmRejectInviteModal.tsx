import React, { useMemo, useState, useCallback, useEffect } from "react";

import RootModal from "../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { ApiResponse } from "floro/dist/src/repo";
import { OrganizationInvitation, useRejectOrganizationInvitationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";

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

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export interface Props {
  onDismiss: () => void;
  show?: boolean;
  invitation: OrganizationInvitation|null;
}

const ConfirmRejectInviteModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"decline invitiation"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const [rejectInvitation, rejectInvitationResult] = useRejectOrganizationInvitationMutation();

  const onDelete = useCallback(() => {
    if (!props.invitation?.id) {
      return;
    }
    rejectInvitation({
      variables: {
        invitationId: props.invitation.id,
      },
    });
  }, [props.invitation]);

  useEffect(() => {
    if (
      rejectInvitationResult?.data?.rejectOrganizationInvitation?.__typename ==
      "RejectOrganizationInvitationSuccess"
    ) {
      props.onDismiss();
    }
  }, [
    rejectInvitationResult?.data?.rejectOrganizationInvitation?.__typename,
    props.onDismiss,
  ]);

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
            {`Are you sure you want to decline this invitation? You will need to ask a member with invite permission to re-invite you if you change your mind.`}
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
            isLoading={rejectInvitationResult.loading}
            isDisabled={!props.invitation?.id}
            onClick={onDelete}
            label={"delete"}
            bg={"red"}
            size={"medium"}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmRejectInviteModal);