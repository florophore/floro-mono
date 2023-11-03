import React, { useCallback} from "react";
import styled from "@emotion/styled";
import HideBookmarksInProfileSetting from "./setting_boxes/HideBookmarksInProfileSetting";
import HideOrganizationsInProfileSetting from "./setting_boxes/HideOrganizationsInProfileSetting";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

interface Props {}

const UserPrivacySettings = (props: Props) => {

  return (
    <Container>
      <InnerContainer>
        <TitleContainer style={{ marginBottom: 48 }}>
          <Title>{"Privacy Settings"}</Title>
        </TitleContainer>
        <HideBookmarksInProfileSetting/>
        <HideOrganizationsInProfileSetting/>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(UserPrivacySettings);
