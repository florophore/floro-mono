import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import {useSearchParams} from 'react-router-dom';

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";
import {
  ComparisonState,
  RemoteCommitState,
  useMergeRequestReviewPage,
  useRemoteCompareFrom,
} from "../hooks/remote-state";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  width: 100%;
  height: 72px;
  border-bottom: 1px solid
    ${(props) => props.theme.colors.localRemoteBorderColor};
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 40px;
  box-shadow: -10px 2px 3px 4px
    ${(props) => props.theme.shadows.versionControlSideBarShadow};
  z-index: 1;
  position: relative;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
`;

const InvalidState = styled.img`
  height: 32px;
  width: 32px;
`;

const InvalidText = styled.span`
  color: ${(props) => props.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  margin-left: 8px;
`;
const CommitsTitle = styled.span`
  color: ${(props) => props.theme.colors.pluginTitle};
  font-weight: 500;
  font-size: 1.4rem;
  font-family: "MavenPro";
  margin-left: 8px;
`;

const ChangeDot = styled.div`
  position: absolute;
  right: -12px;
  top: -2px;
  height: 12px;
  width: 12px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 72px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
}

const RemoteMRReviewHeader = (props: Props) => {
  const theme = useTheme();
  const { compareFrom, setCompareFrom } = useRemoteCompareFrom();
  const [searchParams] = useSearchParams();
  const idxString = searchParams.get('idx');
  const idx = useMemo(() => {
    try {
      if (!idxString) {
        return null;
      }
      const idxInt = parseInt(idxString);
      if (Number.isNaN(idxInt)) {
        return null
      }
      return idxInt;
    } catch(e) {
      return null;
    }
  }, [idxString]);

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const isInvalid = useMemo(() => {
    if (compareFrom == "before") {
      return (
        (props.comparisonState?.beforeRemoteCommitState?.invalidStates?.[
          props?.plugin ?? ""
        ]?.length ?? 0) > 0
      );
    }
    return (
      (props.remoteCommitState?.invalidStates?.[props?.plugin ?? ""]?.length ??
        0) > 0
    );
  }, [
    props.remoteCommitState?.invalidStates,
    props.comparisonState?.beforeRemoteCommitState?.invalidStates,
    props.plugin,
    compareFrom,
  ]);

  const { setReviewPage, reviewPage } = useMergeRequestReviewPage();
  const onChangeComparison = useCallback((compareFrom: "before" | "after") => {
    setCompareFrom(compareFrom);
  }, [compareFrom, reviewPage, props.plugin]);

  const hasAdditions = useMemo(() => {
    if ((props.comparisonState?.apiDiff?.description?.added?.length ?? 0) > 0) {
      return true;
    }
    if ((props.comparisonState?.apiDiff?.licenses?.added?.length ?? 0) > 0) {
      return true;
    }
    if ((props.comparisonState?.apiDiff?.plugins?.added?.length ?? 0) > 0) {
      return true;
    }
    for (const plugin in props.comparisonState?.apiDiff?.store ?? {}) {
      if (
        (props.comparisonState?.apiDiff?.store?.[plugin]?.added?.length ?? 0) >
        0
      ) {
        return true;
      }
    }
    return false;
  }, [props.comparisonState?.apiDiff]);

  const hasRemovals = useMemo(() => {
    if (
      (props.comparisonState?.apiDiff?.description?.removed?.length ?? 0) > 0
    ) {
      return true;
    }
    if ((props.comparisonState?.apiDiff?.licenses?.removed?.length ?? 0) > 0) {
      return true;
    }
    if ((props.comparisonState?.apiDiff?.plugins?.removed?.length ?? 0) > 0) {
      return true;
    }
    for (const plugin in props.comparisonState?.apiDiff?.store ?? {}) {
      if (
        (props.comparisonState?.apiDiff?.store?.[plugin]?.removed?.length ??
          0) > 0
      ) {
        return true;
      }
    }
    return false;
  }, [props.comparisonState?.apiDiff]);

  const onViewCommits = useCallback(() => {
    setReviewPage("commits");
  }, []);

  const onViewChanges = useCallback(() => {
    setReviewPage("changes");
  }, []);

  const onViewMergeRequest = useCallback(() => {
    setReviewPage("none");
  }, []);

  const commitIdx = useMemo(() => {
    if (!idx) {
      return props.repository?.mergeRequest?.commitsCount ?? 0;
    }
    return (props.repository?.mergeRequest?.commitsCount ?? 0) - idx;
  }, [idx, props.repository?.mergeRequest?.commitsCount]);

  return (
    <>
      <Container>
        <LeftContainer>
          {reviewPage == "commits" && (
            <div style={{ marginLeft: 12 }}>
              <CommitsTitle>
                {`Commits to merge`}
                <span style={{ fontWeight: 600 }}>
                  {` (${commitIdx}/${
                    props.repository?.mergeRequest?.commitsCount ?? 0
                  })`}
                </span>
              </CommitsTitle>
            </div>
          )}
          {reviewPage == "changes" && (
            <>
              <div style={{ marginRight: 12 }}>
                <DualToggle
                  onChange={onChangeComparison as (_: string) => void}
                  value={compareFrom}
                  leftOption={{
                    label: (
                      <span style={{ position: "relative" }}>
                        {"removed"}
                        {hasRemovals && (
                          <ChangeDot
                            style={{
                              background: theme.colors.removedBackground,
                            }}
                          />
                        )}
                      </span>
                    ),
                    value: "before",
                  }}
                  rightOption={{
                    label: (
                      <span style={{ position: "relative" }}>
                        {"added"}
                        {hasAdditions && (
                          <ChangeDot
                            style={{ background: theme.colors.addedBackground }}
                          />
                        )}
                      </span>
                    ),
                    value: "after",
                  }}
                />
              </div>
              {isInvalid && (
                <>
                  <InvalidState src={warning} />
                  <InvalidText>{`(invalid)`}</InvalidText>
                </>
              )}
            </>
          )}
        </LeftContainer>

        <RightContainer>
          <>
            {reviewPage == "commits" && (
              <>
                <div style={{ width: 120, marginRight: 24 }}>
                  <Button
                    onClick={onViewChanges}
                    label={"view changes"}
                    bg={"teal"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <Button
                    onClick={onViewMergeRequest}
                    label={"merge request"}
                    bg={"orange"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
              </>
            )}
            {reviewPage == "changes" && (
              <>
                <div style={{ width: 120, marginRight: 24 }}>
                  <Button
                    onClick={onViewCommits}
                    label={"view commits"}
                    bg={"purple"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <Button
                    onClick={onViewMergeRequest}
                    label={"merge request"}
                    bg={"orange"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
              </>
            )}
            </>
        </RightContainer>
      </Container>
    </>
  );
};

export default React.memo(RemoteMRReviewHeader);
