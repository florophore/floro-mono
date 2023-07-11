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
import { Organization, OrganizationInvitation, useCancelOrganizationInvitationMutation, useRejectOrganizationInvitationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";

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

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};


export interface Props {
  onDismiss: () => void;
  show?: boolean;
  invitation: OrganizationInvitation|null;
  organization: Organization;
  currentInvitationId: string|null;
  currentInvitationQuery: string|null;
}

const ConfirmCancelInvitation = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"cancel invitiation"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);
  const firstName = useMemo(
    () => upcaseFirst(props.invitation?.user?.firstName ?? props?.invitation?.firstName ?? ""),
    [props.invitation?.user?.firstName, props?.invitation?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.invitation?.user?.lastName ?? props?.invitation?.lastName ?? ""),
    [props?.invitation?.user?.lastName, props?.invitation?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`?.trim();
  }, [firstName, lastName]);
  const [cancelInvite, cancelInviteResult] = useCancelOrganizationInvitationMutation();
  const onCancel = useCallback(() => {
    if (!props.organization?.id || !props?.invitation?.id) {
        return;
    }
    cancelInvite({
        variables: {
            organizationId: props.organization.id,
            invitationId: props.invitation.id,
            currentInvitationId: props.currentInvitationId,
            currentInvitationQuery: props.currentInvitationQuery,
        }
    });
  }, [props.organization?.id, props?.invitation?.id, props.currentInvitationId, props.currentInvitationQuery]);


  useEffect(() => {
    if (
      cancelInviteResult?.data?.cancelOrganizationInvitation?.__typename ==
      "CancelOrganizationInvitationSuccess"
    ) {
      props.onDismiss();
    }
  }, [
    cancelInviteResult?.data?.cancelOrganizationInvitation?.__typename,
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
            {`Are you sure you want to cancel the invitation to ${userFullname}?`}
          </PromptText>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"back"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            isLoading={cancelInviteResult.loading}
            isDisabled={!props.invitation?.id}
            onClick={onCancel}
            label={"cancel"}
            bg={"red"}
            size={"medium"}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmCancelInvitation);