import React, { useMemo, useCallback } from "react";
import {
  Organization,
  Plugin
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useSearchParams } from "react-router-dom";
import { useOfflineIcon } from "../../offline/OfflineIconsContext";
import OrgProfileInfo from "@floro/storybook/stories/common-components/OrgProfileInfo";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";

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

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  organization: Organization;
  isSelected?: boolean;
}

const OrganizationSearchResultRow = (props: Props) => {
  const theme = useTheme();

  const photo = useOfflineIcon(props?.organization?.profilePhoto?.thumbnailUrl ?? undefined);


  const handleDisplay = useMemo(() => {
    return "@" + props.organization?.handle;
  }, [props.organization?.handle]);

  const displayName = useMemo(() => {
    return upcaseFirst(props.organization?.name ?? "");
  }, [props.organization?.name]);

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
          <OrgProfilePhoto
            size={56}
            organization={props.organization}
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
          >{displayName}</DisplayTitle>
          <SubRow>
              <SubText
                style={{
                  color: props.isSelected
                    ? theme.colors.linkColor
                    : theme.colors.standardTextLight,
                }}

              >{handleDisplay}</SubText>
          </SubRow>
      </CenterInfo>
      <RightSide></RightSide>
    </Row>
  );
};

export default React.memo(OrganizationSearchResultRow);