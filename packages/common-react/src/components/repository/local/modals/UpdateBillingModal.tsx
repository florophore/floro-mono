import React, { useMemo, useState, useCallback, useEffect } from "react";

import RootModal from "../../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { useFragment } from "@apollo/client";
import { UserOrganizationFragmentDoc, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useNavigate } from "react-router-dom";

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
  repository: Repository;
}

const UpdateBillingModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const organizationDoc = useFragment({
    fragment: UserOrganizationFragmentDoc,
    fragmentName: 'UserOrganization',
    from: {
      id: props?.repository.organization?.id as string,
      __typename: 'Organization'
    }
  });

  const navigate = useNavigate();

  const billingLink = useMemo(() => {
    return `/org/@/${organizationDoc?.data.handle}/billing`;
  }, [])

  const onClick = useCallback(() => {
    navigate(billingLink);
  }, [billingLink])

  const canUpdate = useMemo(() => {
    return organizationDoc?.data?.membership?.permissions?.canModifyBilling ?? false;
  }, [organizationDoc?.data?.membership?.permissions?.canModifyBilling])

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"update billing"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  if (!canUpdate) {
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
              {`Please ask a billing admin to update your organization's plan.`}
            </PromptText>
          </TopContentContainer>
          <BottomContentContainer style={{ justifyContent: 'center'}}>
            <Button
              onClick={props.onDismiss}
              label={"done"}
              bg={"gray"}
              size={"extra-big"}
            />
          </BottomContentContainer>
        </ContentContainer>
      </RootModal>
    );

  }

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
            {`In order to enable pushing please acknowledge our future pricing plans from the billing page.`}
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
            onClick={onClick}
            label={"update billing"}
            bg={"orange"}
            size={"medium"}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(UpdateBillingModal);
