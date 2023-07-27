
import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { Plugin, User } from "@floro/graphql-schemas/build/generated/main-graphql";
import { useTheme } from "@emotion/react";
import PluginDefaultSelectedLight from '@floro/common-assets/assets/images/icons/plugin_default.selected.light.svg';
import PluginDefaultSelectedDark from '@floro/common-assets/assets/images/icons/plugin_default.selected.dark.svg';
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

const RowContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 8px;
  cursor: pointer;
`;


const RowImage = styled.img`
    height: 56px;
    width: 56px;
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
  color: ${props => props.theme.colors.pluginDisplayTitle};
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
  color: ${props => props.theme.colors.contrastText};
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  user: User;
  onHoverUser?: (user: User) => void;
  onClickUser?: (user: User) => void;
  isSelected?: boolean;
}

const UserResultRow = (props: Props) => {
  const theme = useTheme();

  const backgroundColor = useMemo(() => {
    if (!props.isSelected) {
        return theme.background;
    }
    return theme.colors.searchHighlightedBackground;
  }, [props.isSelected, theme]);


  const usernameDisplay = useMemo(() => {
    return "@" + props.user?.username;

  }, [props.user]);

  const firstName = useMemo(() => upcaseFirst(props.user?.firstName ?? ""), [props.user?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.user?.lastName ?? ""), [props.user?.lastName]);

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const onClick = useCallback(() => {
    props.onClickUser?.(props.user);
  }, [props.onClickUser, props.user])

  const onMouseEnter = useCallback(() => {
    props.onHoverUser?.(props.user);
  }, [props.onHoverUser, props.user])

  return (
    <RowContainer style={{backgroundColor}} onClick={onClick} onMouseEnter={onMouseEnter}>
        <UserProfilePhoto offlinePhoto={null} user={props.user} size={56}/>
        <RightSideInfo>
            <DisplayTitle>{userFullname}</DisplayTitle>
            <SubRow>
                <SubText>{usernameDisplay}</SubText>
            </SubRow>
        </RightSideInfo>
    </RowContainer>
  );
};

export default React.memo(UserResultRow);