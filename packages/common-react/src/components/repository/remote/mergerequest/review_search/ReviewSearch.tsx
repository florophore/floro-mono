import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import {
  User,
  Repository,
  useSearchUsersForRepoPushAccessLazyQuery,
  useUpdateAnyoneCanPushBranchesUsersMutation,
  MergeRequest,
  useSearchUsersForReviewLazyQuery,
  useUpdateMergeRequestReviewersMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import debouncer from "lodash.debounce";
import FindUserSearchDropdown from "./FindUserSearchDropdown";

import ColorPalette from "@floro/styles/ColorPalette";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchDropdownContainer = styled.div`
  position: absolute;
  left: 0px;
  top: 78px;
  z-index: 1;
`;

const InstructionsText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => ColorPalette.gray};
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

const formatFullname = (firstName: string, lastName: string) => {
  return upcaseFirst(firstName) + " " + upcaseFirst(lastName);
};

export interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
}

const ReviewSearch = (props: Props) => {
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [userInput, setUserInput] = useState("");

  const [users, setUsers] = useState<Array<User>>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const reviewerIds = useMemo(() => {
    return props.mergeRequest?.reviewerRequests?.map((reviewerRequest) => {
      return reviewerRequest?.requestedReviewerUser?.id as string;
    }) ?? [];
  }, [props.mergeRequest?.reviewerRequests]);

  const [searchReviewers, searchReviewersResult] =
    useSearchUsersForReviewLazyQuery({
      fetchPolicy: "no-cache",
    });

  const [updatedReviewers, updatedReviewersMutation] =
    useUpdateMergeRequestReviewersMutation();

  const onHoverSelectedUser = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  const inputIsEmpty = useMemo(() => userInput.trim() == "", [userInput]);

  const searchReviewersDebounced = useCallback(debouncer(searchReviewers, 300), [
    searchReviewers,
  ]);

  const onInputChange = useCallback((text: string) => {
    setUserInput(text);
  }, []);

  useEffect(() => {
    if (!props?.repository?.id || !props?.mergeRequest?.id || inputIsEmpty) {
      return;
    }

    searchReviewersDebounced({
      variables: {
        repositoryId: props.repository.id,
        mergeRequestId: props?.mergeRequest?.id,
        query: userInput,
        excludedUserIds: reviewerIds
      },
    });
  }, [
    inputIsEmpty,
    searchReviewersDebounced,
    props.repository?.id,
    props.mergeRequest?.id,
    userInput,
    reviewerIds,
  ]);

  const userResults = useMemo((): Array<User> => {
    if (inputIsEmpty) {
      return [];
    }
    if (
      searchReviewersResult?.data?.searchUsersForReview?.__typename ==
      "SearchUsersForReviewSuccess"
    ) {
      return (searchReviewersResult?.data?.searchUsersForReview?.users ??
        []) as Array<User>;
    }
    return [];
  }, [inputIsEmpty, searchReviewersResult?.data]);

  const onChooseUser = useCallback((user: User) => {
    if (updatedReviewersMutation.loading) {
      return;
    }
    if (!props?.repository?.id || !props?.mergeRequest?.id) {
      return;
    }
    if (!user?.id) {
        return;
    }
    if (reviewerIds?.includes(user?.id)) {
        return;
    }
    const nextReviewerIds = [...(reviewerIds as Array<string>), user.id];
    updatedReviewers({
      variables: {
        repositoryId: props.repository.id,
        mergeRequestId: props?.mergeRequest?.id,
        reviewerIds: nextReviewerIds
      }
    })
  }, [reviewerIds,
    props.repository?.id,
    props.mergeRequest?.id,
    updatedReviewersMutation.loading
  ]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (userResults.length == 0) {
        return;
      }
      if (event.code == "ArrowDown") {
        event.preventDefault();
        if (
          !selectedUser ||
          !userResults.map((u) => u.id).includes(selectedUser?.id as string)
        ) {
          setSelectedUser(userResults[0] as User);
          return;
        }
        let selectedIndex = 0;
        for (; selectedIndex < userResults.length; ++selectedIndex) {
          if (userResults?.[selectedIndex]?.id == selectedUser.id) {
            break;
          }
        }
        if (selectedIndex == userResults.length - 1) {
          setSelectedUser(userResults[0] as User);
          return;
        }
        setSelectedUser(userResults[selectedIndex + 1] as User);
        return;
      }
      if (event.code == "ArrowUp") {
        event.preventDefault();
        if (
          !selectedUser ||
          !userResults.map((u) => u.id).includes(selectedUser?.id as string)
        ) {
          setSelectedUser(userResults?.[userResults.length - 1] as User);
          return;
        }
        let selectedIndex = 0;
        for (; selectedIndex < userResults.length; ++selectedIndex) {
          if (userResults?.[selectedIndex]?.id == selectedUser.id) {
            break;
          }
        }
        if (selectedIndex == 0) {
          setSelectedUser(userResults?.[userResults.length - 1] as User);
          return;
        }
        setSelectedUser(userResults?.[selectedIndex - 1] as User);
        return;
      }

      if (event.code == "Enter" && selectedUser) {
        if (searchRef.current) {
          searchRef.current.blur?.();
          setSelectedUser(selectedUser);
          const nextUsers = [
            ...users.filter((u) => u.id != selectedUser.id),
            selectedUser,
          ];
          nextUsers.sort((a, b) => {
            if (!a || !b) {
              return 0;
            }
            return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
              `${b?.firstName} ${b?.lastName}`.toLowerCase()
              ? 1
              : -1;
          });
          setUsers(nextUsers);
          setUserInput("");
          onChooseUser(selectedUser);
        }
      }
    },
    [userResults, selectedUser, users, onChooseUser]
  );

  const onClickSelectedUser = useCallback(
    (user: User) => {
      setSelectedUser(user);
      const nextUsers = [...users.filter((u) => u.id != user.id), user];
      nextUsers.sort((a, b) => {
        if (!a || !b) {
          return 0;
        }
        return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
          `${b?.firstName} ${b?.lastName}`.toLowerCase()
          ? 1
          : -1;
      });
      setUsers(nextUsers);
      setUserInput("");
      onChooseUser(user);
    },
    [users, onChooseUser]
  );

  const loaderColor = useMemo((): keyof typeof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);
  return (
    <ContentWrapper>
      <TopWrapper>
        <div style={{ position: "relative" }}>
          <Input
            ref={searchRef}
            value={userInput}
            label={"search for reviewers"}
            placeholder={"search reviewers"}
            onTextChanged={onInputChange}
            widthSize="wide"
            onKeyDown={onKeyDown}
            tabIndex={0}
            disabled={updatedReviewersMutation.loading}
            rightElement={
              <>
                {updatedReviewersMutation.loading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      marginLeft: 8,
                      marginRight: 8,
                    }}
                  >
                    <DotsLoader color={loaderColor} size={"small"} />
                  </div>
                )}
              </>
            }
          />
          {!inputIsEmpty && (
            <SearchDropdownContainer>
              <FindUserSearchDropdown
                users={userResults}
                isLoading={searchReviewersResult.loading}
                onClickUser={onClickSelectedUser}
                onHoverUser={onHoverSelectedUser}
                selectedUser={selectedUser}
              />
            </SearchDropdownContainer>
          )}
        </div>
        <div style={{ width: 468, display: "block", textAlign: "left" }}>
          {(reviewerIds?.length ?? 0) == 0 && (
            <InstructionsText>
              {
                "Search for reviewers by @username, or first name and last name."
              }
            </InstructionsText>
          )}
        </div>
      </TopWrapper>
    </ContentWrapper>
  );
};

export default React.memo(ReviewSearch);
