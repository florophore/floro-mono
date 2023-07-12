
import React, { useMemo, useState, useCallback, useEffect } from "react";

import RootModal from "../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Organization, OrganizationMember, useDeactivateOrganizationMemberMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";

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
  member: OrganizationMember|null;
  organization: Organization;
  currentMemberId: string|null;
  currentMemeberQuery: string|null;
  currentFilterDeactivatedMembers: boolean|null;
}

const ConfirmDeactivateMembershipModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"deactivate member"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);
  const firstName = useMemo(
    () => upcaseFirst(props.member?.user?.firstName ?? ""),
    [props.member?.user?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.member?.user?.lastName ?? ""),
    [props?.member?.user?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`?.trim();
  }, [firstName, lastName]);
  const [deactivateMember, deactivateMemberResult] = useDeactivateOrganizationMemberMutation();
  const onDeactivate = useCallback(() => {
    if (!props.organization?.id || !props?.member?.id) {
        return;
    }
    deactivateMember({
        variables: {
            organizationId: props.organization.id,
            memberId: props.member.id,
            currentMemberId: props.currentMemberId,
            currentMemberQuery: props.currentMemeberQuery,
            filterOutDeactivated: props.currentFilterDeactivatedMembers
        }
    });
  }, [props.organization?.id, props?.member?.id, props.currentMemberId, props.currentMemeberQuery, props.currentFilterDeactivatedMembers]);


  useEffect(() => {
    if (
      deactivateMemberResult?.data?.deactivateOrganizationMembership?.__typename ==
      "DeactivateOrganizationMemberSuccess"
    ) {
      props.onDismiss();
    }
  }, [
    deactivateMemberResult?.data?.deactivateOrganizationMembership?.__typename,
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
            {`Are you sure you want to deactivate ${userFullname}?`}
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
            isLoading={deactivateMemberResult.loading}
            isDisabled={!props.member?.id}
            onClick={onDeactivate}
            label={"deactivate"}
            bg={"red"}
            size={"medium"}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmDeactivateMembershipModal);