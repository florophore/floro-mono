
import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { Plugin, Repository, useNewPluginsQueryQuery, useNewReposQueryQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import NewPluginRow from "./NewPluginRow";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import NewRepoRow from "./NewRepoRow";

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
  padding-left: 16px;
  padding-right: 16px;
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


const NewReposView = () => {
  const newReposQuery = useNewReposQueryQuery({
    variables: {
      lastId: null
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const onLoadMore = useCallback(() => {
    if (newReposQuery?.data?.newRepos?.__typename == "FetchNewReposResult" && newReposQuery?.data?.newRepos?.hasMore) {
      newReposQuery.fetchMore({
        variables: {
          lastId: newReposQuery?.data?.newRepos?.lastId
        },
        updateQuery(previousQueryResult, options) {
          if (previousQueryResult?.newRepos?.__typename != "FetchNewReposResult") {
            return options?.fetchMoreResult;
          }
          if (options?.fetchMoreResult?.newRepos?.__typename != "FetchNewReposResult") {
            return previousQueryResult;
          }
          const nextRepos = [
            ...(previousQueryResult?.newRepos.repos ?? []),
            ...(options?.fetchMoreResult?.newRepos?.repos ?? []),
          ];
          return {
            ...options?.fetchMoreResult,
            newPlugins: {
              ...options?.fetchMoreResult?.newRepos,
              repos: nextRepos
            }
          };
        },
      })
    }
  }, [newReposQuery, newReposQuery?.data?.newRepos])

  const repos = useMemo(() => {
    if (newReposQuery?.data?.newRepos?.__typename == "FetchNewReposResult") {
      return newReposQuery?.data?.newRepos?.repos ?? [];
    }
    return [];
  }, [newReposQuery?.data?.newRepos])

  return (
    <Container>
      <ScrollContainer>
        {repos.map((repo, index) => {
          return <NewRepoRow repo={repo as Repository} key={index} />;
        })}
        <LoadMoreWrapper>
          {!newReposQuery?.loading &&
            newReposQuery?.data?.newRepos?.__typename ==
              "FetchNewReposResult" &&
            newReposQuery?.data?.newRepos?.hasMore && (
              <LoadMore onClick={onLoadMore}>{"load more repos"}</LoadMore>
            )}
          {newReposQuery?.loading && (
            <DotsLoader size="medium" color="linkBlue" />
          )}
        </LoadMoreWrapper>
      </ScrollContainer>
    </Container>
  );

}

export default React.memo(NewReposView);