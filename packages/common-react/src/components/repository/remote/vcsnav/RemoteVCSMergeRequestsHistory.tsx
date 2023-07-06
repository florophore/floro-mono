import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  RepoBranch,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import {
  RemoteCommitState,
  useMergeRequestsFilter,
} from "../hooks/remote-state";
import { useParams, useSearchParams } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import { RepoPage } from "../../types";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { Branch } from "floro/dist/src/repo";
import CreateMergeRequest from "@floro/storybook/stories/repo-components/CreateMergeRequest";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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

const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const SubTitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastTextLight};
  white-space: nowrap;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  height: 184px;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const BranchHistoryContainer = styled.div`
  position: relative;
`;

const BranchNotification = styled.div`
  position: absolute;
  height: 24px;
  width: 24px;
  top: 2px;
  right: -32px;
  background: red;
  border-radius: 50%;
  background: ${ColorPalette.teal};
  border: 2px solid ${props => props.theme.colors.contrastTextLight};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NotificationText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.85rem;
  color: ${ColorPalette.white};
`;

export const getBranchIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  plugin: string;
}

const RemoteVCSMergeRequestsHistory = (props: Props) => {
  const theme = useTheme();
  const [searchParams, setUrlSearchParams] = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const searchQuery = searchParams.get("query");
  const [branch, setBranch] = useState<Branch | null>(null);

  const { filterMR } = useMergeRequestsFilter();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(searchQuery ?? "");
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  useEffect(() => {
    setUrlSearchParams({
      query: searchText,
      plugin: props.plugin,
      filter_mr: filterMR,
      from: "remote",
    });
  }, [searchText, isFocused, filterMR]);

  const linkBase = useRepoLinkBase(props.repository);
  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const onGoBack = useCallback(() => {
    if (showCreate) {
      setShowCreate(false);
      setBranch(null);
      return;
    }
    navigate(homeLink);
  }, [homeLink, showCreate]);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);

  const onCreateMergeRequest = useCallback(() => {
    if (!branch?.id) {
      return;
    }
    navigate(linkBase + "/mergerequests/create/" + branch.id + "?from=remote");
  }, [linkBase, navigate, branch]);

  const onCreateMergeRequestFromNotification = useCallback((branch: RepoBranch) => {
    if (!branch?.id) {
      return;
    }
    navigate(linkBase + "/mergerequests/create/" + branch.id + "?from=remote");
  }, [linkBase, navigate, branch]);

  const branchlessLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [linkBase, props.plugin]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  return (
    <>
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {!showCreate ? "Search Merge Requests" : "New Merge Request"}
            </TitleSpan>
            <div
              style={{
                paddingRight: 10,
                paddingTop: 14,
              }}
            >
              <GoBackIcon src={backArrowIcon} onClick={onGoBack} />
            </div>
          </TitleRow>
          {!showCreate && (
            <>
              <Row>
                <SearchInput
                  value={searchQuery ?? ""}
                  placeholder={"search mearch requests"}
                  onTextChanged={setSearchText}
                  width={464}
                  showClear
                  borderColor={"gray"}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </Row>
              {(props?.repository?.openUserBranchesWithoutMergeRequests
                ?.length ?? 0) > 0 && (
                <>
                <Row>
                  <BranchHistoryContainer>
                    <SubTitleSpan>{'Pending branches'}</SubTitleSpan>

            {(props.repository?.openUserBranchesWithoutMergeRequestsCount ??
              0) > 0 && (
              <BranchNotification>
                <NotificationText>
                  {props.repository
                    ?.openUserBranchesWithoutMergeRequestsCount ?? 0}
                </NotificationText>
              </BranchNotification>
            )}
                  </BranchHistoryContainer>
                </Row>
                  <Row style={{marginTop: 0}}>
                    {props?.repository?.openUserBranchesWithoutMergeRequests?.map(
                      (branch, index) => {
                        return (
                          <ButtonRow key={index} style={{ marginTop: 24 }}>
                            <CreateMergeRequest
                              hideIgnore
                              onCreate={onCreateMergeRequestFromNotification}
                              homeLink={branchlessLink}
                              branch={branch as Branch}
                            />
                          </ButtonRow>
                        );
                      }
                    )}
                  </Row>
                </>
              )}
            </>
          )}
          {showCreate && (
            <Row
              style={{
                marginBottom: 24,
              }}
            >
              <BranchSelector
                size={"wide"}
                branch={(branch as Branch) ?? null}
                branches={
                  (props.repository?.openBranchesWithoutMergeRequests ??
                    []) as Branch[]
                }
                onChangeBranch={setBranch}
              />
            </Row>
          )}
        </TopContainer>
        <BottomContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {!showCreate && (
              <Button
                onClick={onShowCreate}
                label={"new merge request"}
                bg={"teal"}
                size={"extra-big"}
              />
            )}
            {showCreate && (
              <Button
                onClick={onCreateMergeRequest}
                isDisabled={!branch}
                label={"create merge request"}
                bg={"orange"}
                size={"extra-big"}
              />
            )}
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSMergeRequestsHistory);
