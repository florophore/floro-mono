import React, { useMemo, useCallback, useState } from "react";
import {
  Organization,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import { useOfflinePhoto } from "@floro/common-react/src/offline/OfflinePhotoContext";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  border-radius: 8px;
  cursor: pointer;
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
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.contrastText};
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
  color: ${(props) => props.theme.colors.standardTextLight};
`;

interface Props {
  repo: Repository;
}

const RepoRow = (props: Props) => {
  const theme = useTheme();

  const [isHovering, setIsHovering] = useState(false);

  const onMouseOver = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleDisplay = useMemo(() => {
    if (props.repo?.repoType == "user_repo") {
      return "@" + props.repo?.user?.username;
    }
    return "@" + props.repo?.organization?.handle;
  }, [props.repo?.repoType]);

  const linkHref = useMemo(() => {
    if (props.repo?.repoType == "user_repo") {
      return "/repo/@/" + props.repo?.user?.username + "/" + props.repo.name;
    }
    return (
      "/repo/@/" + props.repo?.organization?.handle + "/" + props.repo.name
    );
  }, [props.repo?.repoType]);

  const displayName = useMemo(() => {
    return props.repo?.name;
  }, [props.repo?.name]);

  const orgOfflinePhoto = useOfflinePhoto(
    props.repo?.organization?.profilePhoto ?? null
  );
  const userOfflinePhoto = useOfflinePhoto(
    props.repo?.user?.profilePhoto ?? null
  );

  return (
    <div>
      <Link to={linkHref}>
        <div
          style={{
            display: "inline-block",
            maxWidth: 450,
            width: "100%",
          }}
        >
          <Row onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
            <LeftSide>
              <div style={{ marginRight: 24 }}>
                {props.repo?.repoType == "user_repo" && (
                  <UserProfilePhoto
                    user={props.repo?.user}
                    offlinePhoto={userOfflinePhoto}
                    size={48}
                  />
                )}
                {props.repo?.repoType == "org_repo" && (
                  <OrgProfilePhoto
                    organization={props.repo?.organization as Organization}
                    offlinePhoto={orgOfflinePhoto}
                    size={48}
                  />
                )}
              </div>
            </LeftSide>
            <CenterInfo>
              <DisplayTitle
                style={{
                  color: isHovering
                    ? theme.colors.linkColor
                    : theme.colors.contrastText,
                }}
              >
                {displayName}
              </DisplayTitle>
              <SubRow>
                <SubText
                  style={{
                    color: isHovering
                      ? theme.colors.linkColor
                      : theme.colors.standardTextLight,
                  }}
                >
                  {handleDisplay}
                </SubText>
              </SubRow>
            </CenterInfo>
            <RightSide></RightSide>
          </Row>
        </div>
      </Link>
    </div>
  );
};

export default React.memo(RepoRow);
