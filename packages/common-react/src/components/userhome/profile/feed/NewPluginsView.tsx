
import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { Plugin, useNewPluginsQueryQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import NewPluginRow from "./NewPluginRow";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

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


const NewPluginsView = () => {
  const newPluginsQuery = useNewPluginsQueryQuery({
    variables: {
      lastId: null
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const onLoadMore = useCallback(() => {
    if (newPluginsQuery?.data?.newPlugins?.__typename == "FetchNewPluginsResult" && newPluginsQuery?.data?.newPlugins?.hasMore) {
      newPluginsQuery.fetchMore({
        variables: {
          lastId: newPluginsQuery?.data?.newPlugins?.lastId
        },
        updateQuery(previousQueryResult, options) {
          if (previousQueryResult?.newPlugins?.__typename != "FetchNewPluginsResult") {
            return options?.fetchMoreResult;
          }
          if (options?.fetchMoreResult?.newPlugins?.__typename != "FetchNewPluginsResult") {
            return previousQueryResult;
          }
          const nextPlugins = [
            ...(previousQueryResult?.newPlugins.plugins ?? []),
            ...(options?.fetchMoreResult?.newPlugins?.plugins ?? []),
          ];
          return {
            ...options?.fetchMoreResult,
            newPlugins: {
              ...options?.fetchMoreResult?.newPlugins,
              plugins: nextPlugins
            }
          };
        },
      })
    }
  }, [newPluginsQuery, newPluginsQuery?.data?.newPlugins])

  const plugins = useMemo(() => {
    if (newPluginsQuery?.data?.newPlugins?.__typename == "FetchNewPluginsResult") {
      return newPluginsQuery?.data?.newPlugins?.plugins ?? [];
    }
    return [];
  }, [newPluginsQuery?.data?.newPlugins])

  return (
    <Container>
      <ScrollContainer>
        {plugins.map((plugin, index) => {
          return <NewPluginRow plugin={plugin as Plugin} key={index} />;
        })}
        <LoadMoreWrapper>
          {!newPluginsQuery?.loading && newPluginsQuery?.data?.newPlugins?.__typename == "FetchNewPluginsResult" && newPluginsQuery?.data?.newPlugins?.hasMore && (
            <LoadMore onClick={onLoadMore}>
              {
                'load more plugins'
              }
            </LoadMore>
          )}
          {newPluginsQuery?.loading && (
            <DotsLoader size="medium" color="linkBlue" />
          )}
        </LoadMoreWrapper>
      </ScrollContainer>
    </Container>
  );

}

export default React.memo(NewPluginsView);