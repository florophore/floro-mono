import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import XLight from "@floro/common-assets/assets/images/icons/x_cross.red.svg";
import XDark from "@floro/common-assets/assets/images/icons/x_cross.light_red.svg";

export interface Props {
  label: string;
  user: User;
  width?: number;
  onRemove?: (user: User) => void;
}

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  height: 64px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  user-select: none;
`;

const LabelContainer = styled.div`
  position: relative;
  height: 32;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const InfoContainer = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  top: -27px;
  border: none;
  outline: none;
  padding: 0 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: space-between;
  justify-content: center;
  flex-grow: 1;
`;

const RightSideInfo = styled.div`
  display: flex;
  height: 56px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex-stretch: 1;
  flex-grow: 1;
  margin-left: 16px;
`;

const DisplayTitle = styled.h6`
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SubRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SubText = styled.p`
  margin: 0;
  padding: 0;
  font-size: 0.85rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastText};
`;

const XContainer = styled.div`
    height: 56px;
    width: 24px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

const XIcon = styled.img`
    cursor: pointer;
    height: 24px;
    width: 24px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

const UserDescriptor = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
        return XLight;
    }
    return XDark;
  }, [theme.name]);
  const onRemove = useCallback(() => {
    if (props.user) {
        props?.onRemove?.(props.user);
    }
  }, [props.onRemove, props.user]);
  const usernameDisplay = useMemo(() => {
    return "@" + props.user?.username;
  }, [props.user]);

  const firstName = useMemo(
    () => upcaseFirst(props.user?.firstName ?? ""),
    [props.user?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.user?.lastName ?? ""),
    [props.user?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);
  return (
    <div>
      <Container
        style={{
          border: `2px solid ${theme.colors.inputBorderColor}`,
          width: props?.width ?? 468,
        }}
      >
        <LabelContainer>
          <LabelBorderEnd
            style={{ left: -1, background: theme.colors.inputBorderColor }}
          />
          <LabelText style={{ color: theme.colors.inputLabelTextColor }}>
            {props.label}
          </LabelText>
          <LabelBorderEnd style={{ right: -1 }} />
        </LabelContainer>
        <InfoContainer>
          <UserProfilePhoto user={props.user} size={40} offlinePhoto={null} />
          <RightContainer>
            <RightSideInfo>
                <DisplayTitle>{userFullname}</DisplayTitle>
                <SubRow>
                <SubText>{usernameDisplay}</SubText>
                </SubRow>
            </RightSideInfo>
            <XContainer>
                <XIcon src={xIcon} onClick={onRemove}/>
            </XContainer>
          </RightContainer>
        </InfoContainer>
      </Container>
    </div>
  );
};

export default React.memo(UserDescriptor);
