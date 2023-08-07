import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { CommitInfo, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { RemoteCommitState } from "../hooks/remote-state";
import TimeAgo from "javascript-time-ago";
import CommitWhite from '@floro/common-assets/assets/images/repo_icons/commit.white.svg';
import CommitGray from '@floro/common-assets/assets/images/repo_icons/commit.gray.svg';
import CommitMediumGray from '@floro/common-assets/assets/images/repo_icons/commit.medium_gray.svg';

import en from "javascript-time-ago/locale/en";
import HistoryRow from "./HistoryRow";

const Container = styled.div`
  max-width: 870px;
  display: flex;
  flex-direction: row;
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 24px;
    flex-grow: 1;
`;

const CommitIcon = styled.img`
  height: 32px;
  width: 32px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  display: block;
`;

const Line = styled.div`
    width: 4px;
    height: 100%;
    flex-grow: 1;
    background: ${props => props.theme.colors.contrastTextLight};
    align-self: center;
    border-radius: 16px;
`;


interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  datedCommitGroup: {date: string, commits: Array<CommitInfo>};
  homeLink: string;
  onSelect?: (sha: string, idx: number) => void;
  hideSelect?: boolean;
  plugin?: string;
  isMergeRequest?: boolean;
}

const HistoryDateGroup = (props: Props) => {

  const theme = useTheme();

  const commitIcon = useMemo(() => {
    if (theme.name == "light") {
        return CommitGray;
    }
    return CommitWhite;
  }, [theme.name]);


  return (
    <Container>
        <LeftColumn>
            <CommitIcon src={commitIcon}/>
            <Line/>
        </LeftColumn>
        <RightColumn>
            <Title>
                {`Commits on ${props.datedCommitGroup?.date}`}
            </Title>
            <div style={{
                width: '100%',
                marginBottom: 24
            }}>
              {props.datedCommitGroup?.commits?.map((commit, index) => {
                return (
                  <HistoryRow
                    key={index}
                    repository={props.repository}
                    remoteCommitState={props.remoteCommitState}
                    commit={commit}
                    homeLink={props.homeLink}
                    onSelect={props.onSelect}
                    hideSelect={props.hideSelect}
                    plugin={props.plugin}
                    isMergeRequest={props.isMergeRequest}
                  />
                )
              })}
            </div>

        </RightColumn>
    </Container>
  );
};

export default React.memo(HistoryDateGroup);