
import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { Plugin, Repository, User, useNewPluginsQueryQuery, useNewReposQueryQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import NewPluginRow from "./NewPluginRow";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import NewRepoRow from "./NewRepoRow";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  position: relative;

`;

const ScrollContainer = styled.div`
  max-height: 100%;
  width: 100%;
  overflow-y: scroll;
  position: absolute;
  top: 0;
  left: 0;
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 72px;
`;

const LoadMore = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  color: ${props => props.theme.colors.linkColor};
  text-decoration: underline;
  cursor: pointer;
`;

const InsufficientPermssionsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const InsufficientPermssionsTextWrapper = styled.div`
  width: 80%;
  max-width: 450px;
  margin-top: -80px;
  flex-direction: center;
  justify-content: center;
`;

const InsufficientPermssionsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;


const NoAnnouncementsTitle = styled.h5`
  font-family: "MavenPro";
  color: ${ColorPalette.gray};
  font-weight: 500;
  font-size: 1.4rem;
`;

const findFirstChar = (str: string) => {
  for (let i = 0; i < str.length; ++i) {
    if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
  }
  return "";
};

const upcaseFirst = (str: string) => {
  const firstChar = findFirstChar(str);
  const pos = str.toLowerCase().indexOf(firstChar.toLowerCase());
  return firstChar + str.substring(pos + 1);
};


interface Props {
  repos: Repository[];
  user: User;
  isSelf: boolean;
}

const BookmarkedReposView = (props: Props) => {

  const firstName = useMemo(() => upcaseFirst(props?.user?.firstName ?? ""), [props.user?.firstName]);

  if (props.repos.length == 0) {

    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <NoAnnouncementsTitle
            style={{ textAlign: "center", fontSize: "1.7rem" }}
          >
            {!props.isSelf &&
              `${firstName} hasn't bookmarked any repositories yet.`}
            {props.isSelf &&
              `You haven't bookmarked any repositories yet.`}
          </NoAnnouncementsTitle>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }
  return (
    <Container>
      <ScrollContainer>
        {props.repos.map((repo, index) => {
          return <NewRepoRow repo={repo as Repository} key={index} />;
        })}
      </ScrollContainer>
    </Container>
  );

}

export default React.memo(BookmarkedReposView);