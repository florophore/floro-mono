import React, { useMemo, useCallback } from "react";
import {
  Organization,
  Plugin,
  User
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useSearchParams } from "react-router-dom";
import { useOfflineIcon } from "../../offline/OfflineIconsContext";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  border-radius: 8px;
  padding: 0 8px;
  cursor: pointer;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CenterInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 5;
  height: 56px;
`;

const RightSide = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 56px;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-right: 24px;
`;

const DisplayName = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.connectionTextColor};
  &:hover {
    color: ${(props) => props.theme.colors.titleText};
    cursor: pointer;
  }
`;

const DisplayTitle = styled.h6`
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${props => props.theme.colors.contrastText};
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
  padding: 4px 0 0 0;
  font-size: 1rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${props => props.theme.colors.standardTextLight};
`;

interface Props {
  user: User;
  isSelected?: boolean;
}

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

const UserSearchResultRow = (props: Props) => {
  const theme = useTheme();

  const photo = useOfflineIcon(props?.user?.profilePhoto?.thumbnailUrl ?? undefined);

  const usernameDisplay = useMemo(() => {
    return "@" + props.user?.username;
  }, [props.user]);

  const firstName = useMemo(() => upcaseFirst(props.user?.firstName ?? ""), [props.user?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.user?.lastName ?? ""), [props.user?.lastName]);

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const onClick = useCallback(() => {
    //const params = {};
    //for(let [key, value] of searchParams.entries()) {
    //  params[key] = value;
    //}
    //params["plugin"] = props.pluginVersion.name;
    //setSearchParams(params)
  }, []);


  return (
    <Row style={{
        background: props.isSelected ? theme.colors.highlightedOptionBackgroundColor : theme.background
    }}>
      <LeftSide>
        <div style={{marginRight: 24}}>
          <UserProfilePhoto
            size={56}
            user={props.user}
            offlinePhoto={photo}
          />
        </div>
      </LeftSide>
      <CenterInfo>
          <DisplayTitle
            style={{
              color: props.isSelected
                ? theme.colors.linkColor
                : theme.colors.contrastText,
            }}
          >{userFullname}</DisplayTitle>
          <SubRow>
              <SubText
                style={{
                  color: props.isSelected
                    ? theme.colors.linkColor
                    : theme.colors.standardTextLight,
                }}
              >{usernameDisplay}</SubText>
          </SubRow>
      </CenterInfo>
      <RightSide>
      </RightSide>
    </Row>
  );
};

export default React.memo(UserSearchResultRow);