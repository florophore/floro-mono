import React, { useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import styled from "@emotion/styled";
import ProfileInfo from "@floro/storybook/stories/common-components/ProfileInfo";
import FollowerInfo from "@floro/storybook/stories/common-components/FollowerInfo";
import UserSettingsTab from "@floro/storybook/stories/common-components/UserSettingsTab";
import DevSettingsTab from "@floro/storybook/stories/common-components/DevSettingsTab";
import ConnectionStatusTab from "@floro/storybook/stories/common-components/ConnectionStatusTab";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSession } from "../../session/session-context";
import { useDaemonIsConnected } from "../../pubsub/socket";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
`;

const UserNav = styled.div`
  width: 263px;
  border-right: 1px solid ${(props) => props.theme.colors.commonBorder};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BottomNavContainer = styled.div`
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const ButtonActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProfileInfoWrapper = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.colors.commonBorder};
`;
const TopInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export interface Props {
  isOpen?: boolean;
}

const UserHome = (props: Props) => {
  const { currentUser } = useSession();
  const isDaemonConnected = useDaemonIsConnected();
  const navigate = useNavigate();

  const onGoToCreateOrg = useCallback(() => {
    navigate('/home/create-org');
  }, [navigate]);

  return (
    <Background>
      <UserNav>
        <ProfileInfoWrapper>
          <ProfileInfo
            firstName={currentUser?.firstName ?? ""}
            lastName={currentUser?.lastName ?? ""}
            username={currentUser?.username ?? ""}
          />
        </ProfileInfoWrapper>
        <BottomNavContainer>
          <TopInfo>
            <FollowerInfo
              followerCount={190}
              followingCount={0}
              username={currentUser?.username ?? ""}
            />
            <div style={{ marginTop: 16, display: "flex" }}>
              <UserSettingsTab />
            </div>
            <div style={{ marginTop: 16, display: "flex" }}>
              <DevSettingsTab />
            </div>
            <div style={{ marginTop: 16, display: "flex" }}>
              <ConnectionStatusTab isConnected={isDaemonConnected ?? false} />
            </div>
          </TopInfo>
          <ButtonActionWrapper>
            <Button
              style={{ marginBottom: 16 }}
              label={"create repo"}
              size={"medium"}
              bg={"purple"}
            />
            <Button onClick={onGoToCreateOrg} label={"create org"} size={"medium"} bg={"teal"} />
          </ButtonActionWrapper>
        </BottomNavContainer>
      </UserNav>
      <MainContent></MainContent>
    </Background>
  );
};

export default React.memo(UserHome);
