import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Repository,
  useUpdateAutomaticallyDeleteMergedFeatureBranchesMutation,
  useUpdateUserSettingMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSession } from "../../../session/session-context";
import { useIsOnline } from "../../../hooks/offline";

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

const TitleSpan = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
  flex-direction: column;
`;

interface Props {
}

const HideOrganizationsInProfileSetting = (props: Props) => {
  const { currentUser} = useSession();
  const [hideOrganizationsInProfile, setHideOrganizationInProfile] =
    useState<boolean>(currentUser?.hideOrganizationsInProfile ?? false);

  const [
    updateSetting,
    updateSettingRequest,
  ] = useUpdateUserSettingMutation();

  const theme = useTheme();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setHideOrganizationInProfile(
      currentUser?.hideOrganizationsInProfile ?? false
    );
  }, [currentUser?.hideOrganizationsInProfile]);

  const onChange = useCallback(() => {
    setHideOrganizationInProfile(!hideOrganizationsInProfile);
    updateSetting({
      variables: {
        settingName: "hideOrganizationsInProfile",
        value: !hideOrganizationsInProfile
      }
    })
  }, [hideOrganizationsInProfile]);

  const isOnline = useIsOnline();

  return (
    <Container>
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={hideOrganizationsInProfile}
            onChange={onChange}
            disabled={!isOnline}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Hide Organizations in Your Public Profile"}</Title>
            {updateSettingRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "When someone who isn't you is viewing your profile, decide if they can see organization you are an active member of."
            }
          </SubTitle>
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(HideOrganizationsInProfileSetting);