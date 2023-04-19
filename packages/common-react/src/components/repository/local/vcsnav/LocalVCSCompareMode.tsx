import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getColorForRow } from "@floro/storybook/stories/common-components/SourceGraph/color-mod";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import CompareSelector from "@floro/storybook/stories/repo-components/CompareSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse, Branch, SourceCommitNode } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useCanAutoMerge, useCanMoveWIP, useMergeSha, useSourceGraph, useUpdateComparison, useUpdateCurrentCommand } from "../hooks/local-hooks";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { mapSourceGraphRootsToGrid } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import SelectedShaDisplay from "@floro/storybook/stories/repo-components/SelectedShaDisplay";
import ComparisonSourceGraphSelect from "./ComparisonSourceGraphSelect";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const MergeInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const NothingToMerge = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.standardTextLight};
  font-style: italic;
`;

const MergeOkay = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.addedText};
  font-style: italic;
`;

const MergeError = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.removedText};
  font-style: italic;
`;


interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
}

const LocalVCSCompareMode = (props: Props) => {
  const { subAction, setSubAction } = useLocalVCSNavContext();
  const { data: sourceGraphResponse, isLoading: sourceGraphLoading } = useSourceGraph(props.repository);
  const comparison = useMemo(
    () => props?.apiResponse?.repoState?.comparison,
    [props?.apiResponse?.repoState?.comparison]
  );
  const [against, setAgainst] = useState<"wip" | "branch" | "sha" | "merge">(
    comparison?.against ?? "wip"
  );

  const mergeMutation = useMergeSha(props.repository);

  useEffect(() => {
    setSubAction(null);
  }, []);

  useEffect(() => {
    setSubAction(null);
  }, [mergeMutation.isSuccess]);

  const theme = useTheme();
  const [sha, setSha] = useState(props?.apiResponse?.repoState?.comparison?.commit);

  const gridData = useMemo(
    () =>
      mapSourceGraphRootsToGrid(
        sourceGraphResponse?.rootNodes ?? [],
        sourceGraphResponse?.branches ?? [],
      ),
    [sourceGraphResponse?.rootNodes, sourceGraphResponse?.branches]
  );

  const branchHeadColor = useMemo(() => {
    if (!sha) {
      return 'transparent';
    }
    const sourceCommit = gridData.pointerMap[sha];
    if (!sourceCommit) {
      return 'transparent';
    }
    if (sourceCommit?.branchIds.length == 0) {
      return 'transparent';
    }
    return getColorForRow(theme, sourceCommit.row);
  }, [gridData.pointerMap, sha, theme]);

  useEffect(() => {
    setSha(props?.apiResponse?.repoState?.comparison?.commit);
  }, [props?.apiResponse?.repoState?.comparison?.commit])

  const comparisonBranch = useMemo(
    () =>
      sourceGraphResponse?.branches?.find((v) => v.id == comparison?.branch) ??
      null,
    [sourceGraphResponse?.branches, comparison?.branch]
  );

  const updateComparisonMutation = useUpdateComparison(props.repository);
  const onShowBranches = useCallback(() => {
    setSubAction(null);
    setSubAction("branches");
  }, []);

  const onShowShaSelector = useCallback(() => {
    setSubAction("select_comparison_sha");
  }, []);

  const onHideShaSelector = useCallback(() => {
    setSubAction(null);
  }, []);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey && event.key == "b") {
        onShowBranches();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  const updateCommand = useUpdateCurrentCommand(props.repository);

  const updateToViewMode = useCallback(() => {
    setSubAction(null);
    updateCommand.mutate("view");
  }, [updateCommand]);

  const onGoBack = useCallback(() => {
    if (subAction == "select_comparison_sha") {
      setSubAction(null);
      return;
    }
    updateToViewMode();
  }, [subAction, updateToViewMode])

  const onGoToCommitPage = useCallback(() => {
    setSubAction("write_commit");
  }, []);

  const onUpdateComparisonBranch = useCallback(
    (branch: Branch|null) => {
      updateComparisonMutation.mutate({
        against: "branch",
        branch: branch?.id ?? null,
      });
    },
    [
      props.apiResponse?.baseBranch,
      props?.apiResponse?.branch?.lastCommit,
      sourceGraphResponse?.branches,
      updateComparisonMutation,
    ]
  );

  const onUpdateComparisonSha = useCallback(
    (sourceCommit: SourceCommitNode|null) => {
      updateComparisonMutation.mutate({
        against: "sha",
        sha: sourceCommit?.sha
      });
    },
    [
      sourceGraphResponse?.branches,
      updateComparisonMutation,
    ]
  );

  const onUpdateComparisonAgainst = useCallback(
    (value: "wip" | "branch" | "sha") => {
      if (value == "wip") {
        updateComparisonMutation.mutate({
          against: "wip",
        });
        setAgainst("wip");
        setSubAction(null);
        return;
      }

      if (value == "branch") {
        updateComparisonMutation.mutate({
          against: "branch",
          branch:
            props.apiResponse?.baseBranch?.id ??
            sourceGraphResponse?.branches?.[0]?.id,
        });
        setAgainst("branch");
        setSubAction(null);
        return;
      }

      if (value == "sha") {
        updateComparisonMutation.mutate({
          against: "sha",
          sha: props?.apiResponse?.lastCommit?.parent,
        });
        setAgainst("sha");
        setSha(props?.apiResponse?.lastCommit?.parent);
        return;
      }
    },
    [
      props.apiResponse?.baseBranch,
      props?.apiResponse?.branch?.lastCommit,
      sourceGraphResponse?.branches,
      updateComparisonMutation,
    ]
  );

  const comparisonSha = useMemo(() => {
    if (props.apiResponse?.repoState?.comparison?.against == "wip") {
      return undefined;
    }
    if (props.apiResponse?.repoState?.comparison?.against == "branch") {
      return comparisonBranch?.lastCommit;
    }
    return props.apiResponse?.repoState?.comparison?.commit;
  }, [
    comparisonBranch,
    props.apiResponse?.repoState?.comparison,
  ]);

  const canAutoMergeQuery = useCanAutoMerge(props.repository, comparisonSha);

  const comparisonShaIsAncestor = useMemo(() => {
    if (!comparisonSha) {
      return false;
    }
    const toSha = props?.apiResponse?.lastCommit?.sha;
    if (!toSha) {
      return true;
    }
    if (comparisonSha == toSha) {
      return true;
    }
    let current: SourceCommitNode = gridData.pointerMap[toSha];
    while (current?.parent) {
      current = gridData.pointerMap[current.parent];
      if (current.sha == comparisonSha) {
        return true;
      }
    }
    return false;
  }, [
    comparisonSha,
    props?.apiResponse?.lastCommit?.sha,
    gridData.pointerMap
  ]);

  const comparisonShaIsChildAncestor = useMemo(() => {
    if (!comparisonSha) {
      return false;
    }
    const toSha = props?.apiResponse?.lastCommit?.sha;
    if (!toSha) {
      return true;
    }
    if (comparisonSha == toSha) {
      return true;
    }
    let current: SourceCommitNode = gridData.pointerMap[comparisonSha];
    while (current?.parent) {
      current = gridData.pointerMap[current.parent];
      if (current.sha == toSha) {
        return true;
      }
    }
    return false;
  }, [
    comparisonSha,
    props?.apiResponse?.lastCommit?.sha,
    gridData.pointerMap
  ]);

  const comparisonShaIsNone = useMemo(() => {
    if (props.apiResponse?.repoState?.comparison?.against == "wip") {
      return false;
    }
    if (!comparisonSha) {
      return true;
    }
    return false;
  }, [
    comparisonSha,
    props.apiResponse?.repoState?.comparison?.against,
  ]);

  const canSwitchWIPQuery = useCanMoveWIP(props.repository, comparisonSha);

  const mergeIsDisabled = useMemo(() => {
    if (comparison?.against == "branch" || comparison?.against == "sha") {
      if ((comparisonShaIsAncestor ||  comparisonShaIsNone) && !canAutoMergeQuery.isLoading) {
        return true;
      }
      if (comparisonShaIsChildAncestor) {
        // CHECK TO SEE
        return props?.apiResponse?.isWIP && !canSwitchWIPQuery?.data?.canSwitch;
      }
      if (comparisonShaIsAncestor || comparisonShaIsNone) {
        return true;
      }

      if (
        (!canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState && props.apiResponse.isWIP)
      ) {
        return true;
      }
      return false;
    }
    return true;
  }, [
    comparison?.against,
    comparisonShaIsAncestor,
    comparisonShaIsChildAncestor,
    comparisonShaIsNone,
    canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState,
    canAutoMergeQuery?.data?.canAutoMergeOnUnStagedState,
    props.apiResponse.isWIP,
    canSwitchWIPQuery?.data?.canSwitch
  ]);

  const onMerge = useCallback(() => {
    if (mergeIsDisabled || !comparisonSha) {
      return;
    }
    mergeMutation.mutate({
      sha: comparisonSha,
    });
  }, [mergeIsDisabled, comparisonSha, mergeMutation]);

  return (
    <>
      <InnerContent>
        <TopContainer>
          <CurrentInfo
            respository={props.repository}
            showWIP
            isWIP={props.apiResponse.isWIP}
            branch={props.apiResponse.branch}
            baseBranch={props.apiResponse.baseBranch}
            lastCommit={props.apiResponse.lastCommit}
            showBackButton
            onGoBack={onGoBack}
          />
          <div style={{ position: "relative" }}>
            {against != "merge" && (
              <Row style={{ marginTop: 12 }}>
                <CompareSelector
                  size="wide"
                  isLoading={updateComparisonMutation.isLoading}
                  value={against}
                  onChangeAgainst={onUpdateComparisonAgainst}
                />
              </Row>
            )}
            {props?.apiResponse?.repoState?.comparison?.against == "branch" && (
              <ButtonRow style={{ marginTop: 12 }}>
                <div>
                  {/** FILL ME IN */}
                  <BranchSelector
                    size="wide"
                    branches={sourceGraphResponse?.branches ?? []}
                    branch={comparisonBranch}
                    onChangeBranch={onUpdateComparisonBranch}
                    allowNone
                  />
                </div>
              </ButtonRow>
            )}
            {props?.apiResponse?.repoState?.comparison?.against == "sha" && (
              <ButtonRow style={{ marginTop: 12 }}>
                <SelectedShaDisplay
                  widthSize={"wide"}
                  label={"commit"}
                  sha={sha}
                  message={gridData?.pointerMap?.[sha ?? ""]?.message}
                  shaBackground={branchHeadColor}
                  button={
                    subAction == "select_comparison_sha" ? (
                      <Button
                        label={"compare"}
                        bg={"purple"}
                        size={"small"}
                        onClick={onHideShaSelector}
                      />
                    ) : (
                      <Button
                        label={"switch"}
                        bg={"orange"}
                        size={"small"}
                        onClick={onShowShaSelector}
                      />
                    )
                  }
                />
              </ButtonRow>
            )}
          </div>
        </TopContainer>
        <BottomContainer>
          {(comparison?.against == "branch" ||
            comparison?.against == "sha") && (
            <MergeInfoRow>
              {(comparisonShaIsAncestor ||  comparisonShaIsNone) && !canAutoMergeQuery.isLoading && (
                <NothingToMerge>{"Nothing to merge"}</NothingToMerge>
              )}
              {!(comparisonShaIsAncestor || comparisonShaIsNone) && !canAutoMergeQuery.isLoading && (
                <>
                  {(!comparisonShaIsChildAncestor && ((canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState) &&
                    (canAutoMergeQuery?.data?.canAutoMergeOnUnStagedState))) && (
                      <>
                        {props.apiResponse.isWIP && (
                          <MergeOkay>
                            {
                              "Able to auto-merge changes (Please note: uncommitted changes will merge but will not be committed)"
                            }
                          </MergeOkay>
                        )}
                        {!props.apiResponse.isWIP && (
                          <MergeOkay>{"Able to auto-merge changes"}</MergeOkay>
                        )}
                      </>
                    )}
                  {comparisonShaIsChildAncestor && (
                      <>
                        {props.apiResponse.isWIP && (
                          <MergeOkay>
                            {
                              "Able to auto-merge changes (Please note: uncommitted changes will merge but will not be committed)"
                            }
                          </MergeOkay>
                        )}
                        {!props.apiResponse.isWIP && (
                          <>
                          {canSwitchWIPQuery?.data?.canSwitch && (
                            <MergeOkay>{"Able to auto-merge changes"}</MergeOkay>
                          )}
                          {!canSwitchWIPQuery?.data?.canSwitch && (
                            <MergeError>
                              {
                                "Unable to merge uncommitted changes (stash or commit current changes)"
                              }
                            </MergeError>
                          )}
                          </>
                        )}
                      </>

                  )}
                  {!comparisonShaIsChildAncestor && !canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState &&
                    (canAutoMergeQuery?.data?.canAutoMergeOnUnStagedState) && (
                      <MergeError>
                        {
                          "Unable to merge uncommitted changes (stash or commit current changes)"
                        }
                      </MergeError>
                    )}

                  {!comparisonShaIsChildAncestor && canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState &&
                    !canAutoMergeQuery?.data?.canAutoMergeOnUnStagedState && (
                      <MergeError>
                        {
                          "Unable to merge, however, current changes can auto-merge (stash or commit current changes to merge)"
                        }
                      </MergeError>
                    )}

                  {!comparisonShaIsChildAncestor && !canAutoMergeQuery?.data?.canAutoMergeOnTopOfCurrentState &&
                    !canAutoMergeQuery?.data?.canAutoMergeOnUnStagedState && (
                      <>
                        {props.apiResponse.isWIP && (
                          <MergeError>
                            {
                              "Unable to merge (stash or commit current changes to merge)"
                            }
                          </MergeError>
                        )}
                        {!props.apiResponse.isWIP && (
                          <MergeError>
                            {
                              "Unable to auto-merge (manual resolution required)"
                            }
                          </MergeError>
                        )}
                      </>
                    )}
                </>
              )}
            </MergeInfoRow>
          )}
          <ButtonRow>
            <RepoActionButton
              onClick={onGoToCommitPage}
              isDisabled={
                !props.apiResponse?.isWIP || comparison?.against != "wip"
              }
              label={"commit"}
              icon={"commit"}
            />
            <RepoActionButton
              isDisabled={mergeIsDisabled}
              label={"merge"}
              icon={"merge"}
              isLoading={mergeMutation.isLoading}
              onClick={onMerge}
            />
          </ButtonRow>
          <ButtonRow style={{ marginTop: 24 }}>
            <Button
              isDisabled
              label={"push to remote"}
              bg={"purple"}
              size={"extra-big"}
            />
          </ButtonRow>
        </BottomContainer>
      </InnerContent>
      {sourceGraphResponse &&
        subAction == "select_comparison_sha" &&
        props?.apiResponse?.repoState?.comparison?.commit &&
        sha && (
          <ComparisonSourceGraphSelect
            onUpdateComparisonSha={onUpdateComparisonSha}
            comparisonIsLoading={updateComparisonMutation.isLoading}
            sourceGraphLoading={sourceGraphLoading}
            sourceGraphResponse={sourceGraphResponse}
            apiResponse={props.apiResponse}
            sha={sha}
          />
        )}
    </>
  );
};

export default React.memo(LocalVCSCompareMode);
