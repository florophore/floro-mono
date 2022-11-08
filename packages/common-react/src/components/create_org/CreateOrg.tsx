import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ProfileInfo from "@floro/storybook/stories/common-components/ProfileInfo";
import FollowerInfo from "@floro/storybook/stories/common-components/FollowerInfo";
import UserSettingsTab from "@floro/storybook/stories/common-components/UserSettingsTab";
import ConnectionStatusTab from "@floro/storybook/stories/common-components/ConnectionStatusTab";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import ToolTip from "@floro/storybook/stories/design-system/ToolTip";
import { useSession } from "../../session/session-context";
import { useDaemonIsConnected } from "../../pubsub/socket";
import ColorPalette from "@floro/styles/ColorPalette";
import InfoLightIcon from "@floro/common-assets/assets/images/icons/info.light.svg";
import InfoDarkIcon from "@floro/common-assets/assets/images/icons/info.dark.svg";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
  padding: 24px;
`;

const Title = styled.h1`
    font-family: "MavenPro";
    font-size: 2rem;
    font-weight: 600;
    color: ${(props) => props.theme.colors.titleTextColor};
`;

const InfoImage = styled.img`
  height: 32px;
  width: 32px;
  margin-left: 12px;
  margin-top: 6px;
  margin-bottom: -6px;
`;

const CreateOrg = () => {
    const { currentUser, session } = useSession();
    const [name, setName] = useState("");
    const [contactEmail, setContactEmail] = useState(session?.authenticationCredentials?.[0]?.email ?? "");
    const navigate = useNavigate();
    const theme = useTheme();

  const infoIcon = useMemo(() => {
    if (theme.name == "light") {
      return InfoLightIcon;
    }
    return InfoDarkIcon;
  }, [theme.name]);

    useEffect(() => {
        if (!currentUser) {
            navigate("/");
        }
    }, [currentUser]);

    return (
      <Background>
        <Title>{"New Organization"}</Title>
        <div
          className={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 24px;
          `}
        >
          <Input
            value={name}
            onTextChanged={setName}
            label="organization legal name"
            placeholder="organization legal name"
          />
        </div>
        <div
          className={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 24px;
          `}
        >
          <Input
            value={contactEmail}
            onTextChanged={setContactEmail}
            label="contact email"
            placeholder="contact email"
          />
        </div>
        <div
          className={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 24px;
          `}
        >
          <Input
            value={name}
            onTextChanged={setName}
            label="organization account handle"
            placeholder="organization @handle"
          />
          <ToolTip show={false} inner={<div style={{height: 240, width: 200}}>TESTING</div>}>
            <InfoImage src={infoIcon}/>
          </ToolTip>
        </div>
      </Background>
    );
}

export default React.memo(CreateOrg);