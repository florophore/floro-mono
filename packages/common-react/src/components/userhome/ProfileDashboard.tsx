
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import RepoBriefInfoRow from "@floro/storybook/stories/common-components/RepoBriefInfoRow";
import {
  User,
  Organization,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette from "@floro/styles/ColorPalette";
import { useLocalRepos, useUserRepos } from "../../hooks/repos";
import ProfileHeader from "./profile/ProfileHeader";
import UserAnnouncements from "./profile/feed/UserAnnouncements";
import BookmarkedReposView from "./profile/feed/BookmarkedReposView";

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
`;

const MainContainer = styled.div`
  width: 263px;
  border-right: 1px solid ${(props) => props.theme.colors.commonBorder};
  height: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const SideBar = styled.div`
  width: 263px;
  max-width: 263px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const SideBarTitleWrapper = styled.div`
  display: flex;
  padding: 16px;
  margin: 0;
  align-items: center;
  border-bottom: 1px solid
    ${(props) => props?.theme.colors.sidebarTitleBorderColor};
`;

const SideBarTitle = styled.h5`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.sidebarTitleTextColor};
  font-weight: 600;
  font-size: 1.44rem;
  position: relative;
`;

const RepoContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 5;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.commonBorder};
  overflow: hidden;
  max-width: 263px;
  position: relative;
`;

const RepoInnerContainer = styled.div`
  width: 100%;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  height: 100%;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 9px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: transparent;
  }
`;

const InvitationContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 4;
  flex-direction: column;
`;

const TopGradient = styled.div`
  background-color: red;
  width: 263px;
  position: absolute;
  top: 60.2px;
  height: 16px;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundFullOpacity},
    ${(props) => props.theme.gradients.backgroundNoOpacity}
  );
`;

const BottomGradiuent = styled.div`
  background-color: red;
  width: 263px;
  position: absolute;
  bottom: 0px;
  height: 16px;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundNoOpacity},
    ${(props) => props.theme.gradients.backgroundFullOpacity}
  );
`;

const NoReposText = styled.span`
  font-family: "MavenPro";
  color: ${ColorPalette.gray};
  font-weight: 500;
  font-size: 1.4rem;
`

interface Props {
    user?: User;
}
const ProfileDashboard = (props: Props) => {
  const { repositories } = useUserRepos(props.user);
  const localRepos = useLocalRepos();
  const localRepoIds = useMemo(() => {
    if (!localRepos) {
      return new Set();
    }
    return new Set(localRepos ?? []);
  }, [localRepos]);
  const [page, setPage] = useState<'feed'|'bookmarks'>('feed');


  return (
    <Container>
      <MainContainer>
        {props.user && (
          <ProfileHeader user={props.user} page={page} onChangePage={setPage} />
        )}
        {page == "feed" && props.user && (
          <UserAnnouncements user={props.user} />
        )}
        {page == "bookmarks" && props.user && (
          <BookmarkedReposView
            repos={(props.user?.bookmarkedRepositories ?? []) as Repository[]}
            user={props.user}
            isSelf={false}
          />
        )}
      </MainContainer>
      <SideBar>
        <RepoContainer style={{ borderBottom: 0 }}>
          <SideBarTitleWrapper>
            <SideBarTitle>{`Repositories (${repositories.length})`}</SideBarTitle>
          </SideBarTitleWrapper>
          <RepoInnerContainer>
            {repositories?.length == 0 && (
              <NoReposText>{"No repos created yet"}</NoReposText>
            )}
            {repositories?.map((repo, index) => {
              return (
                <RepoBriefInfoRow
                  repo={repo as Repository}
                  key={index}
                  isLocal={localRepoIds.has(repo?.id)}
                />
              );
            })}
          </RepoInnerContainer>
          <TopGradient />
          <BottomGradiuent />
        </RepoContainer>
      </SideBar>
    </Container>
  );
};

export default React.memo(ProfileDashboard);

