import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import {
  User,
  Repository,
  useUpdateAnyoneCanCreateMergeRequestsUsersMutation,
  useSearchUsersForProtectedBranchAccessLazyQuery,
  useUpdateAnyoneWithApprovalCanMergeUsersMutation,
  useUpdateAnyoneCanRevertUsersMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import debouncer from "lodash.debounce";
import FindUserSearchDropdown from "../setting_modals/FindUserSearchDropdown";

import ColorPalette from "@floro/styles/ColorPalette";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

import WhiteX from "@floro/common-assets/assets/images/icons/x_cross.white.svg";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  transition: 500ms color;
  user-select: none;
  color: ${(props) => props.theme.colors.titleText};
`;

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 470px;
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

const UserContainer = styled.div`
  margin-bottom: 24px;
  height: 360px;
  width: 470px;
  position: relative;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
`;

const InnerContainer = styled.div`
  max-height: 100%;
  width: 100%;
  overflow-y: scroll;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
`;

const UserLabelContainer = styled.div`
  position: absolute;
  top: -16px;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const UserLabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;

const UserLabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;

const PlaceholderText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  margin-top: 8px;
  margin-left: 6px;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const PillContainer = styled.div`
  height: 32px;
  background: ${(props) => props.theme.colors.titleText};
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 6px;
  padding: 4px 12px 4px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const PillText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${ColorPalette.white};
  user-select: none;
`;

const PillX = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 12px;
  cursor: pointer;
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
  show: boolean;
  onDismissModal: () => void;
  repository: Repository;
}

const CanRevertUsersModal = (props: Props) => {
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [userInput, setUserInput] = useState("");

  const [updateUsers, updateUsersRequest] = useUpdateAnyoneCanRevertUsersMutation();

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState<Array<User>>([] as Array<User>);

  const [searchUsers, searchUsersResult] =
    useSearchUsersForProtectedBranchAccessLazyQuery({
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    if (props.show) {
      setUserInput("");
      setSelectedUser(undefined);
      const nextUsers = (props?.repository?.protectedBranchRule?.canRevertUsers ??
        []) as Array<User>;
      setUsers(nextUsers);
      if (searchRef.current) {
        searchRef.current.focus?.();
      }
      updateUsersRequest.reset();
    } else {
      setUserInput("");
      setSelectedUser(undefined);
      const nextUsers = (props?.repository?.protectedBranchRule?.canRevertUsers ??
        []) as Array<User>;
      setUsers(nextUsers);
    }
  }, [props.show]);

  const onHoverSelectedUser = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  const inputIsEmpty = useMemo(() => userInput.trim() == "", [userInput]);

  const searchUsersDebounced = useCallback(debouncer(searchUsers, 300), [
    searchUsers,
  ]);

  const onInputChange = useCallback((text: string) => {
    setUserInput(text);
  }, []);

  useEffect(() => {
    if (!props?.repository?.id || inputIsEmpty) {
      return;
    }

    searchUsersDebounced({
      variables: {
        repositoryId: props.repository.id,
        query: userInput,
        excludedUserIds: users.map((u) => u.id as string),
      },
    });
  }, [
    inputIsEmpty,
    searchUsersDebounced,
    props.repository?.id,
    userInput,
    users,
  ]);

  const userResults = useMemo((): Array<User> => {
    if (inputIsEmpty) {
      return [];
    }
    if (
      searchUsersResult?.data?.searchUsersForProtectedBranchAccess?.__typename ==
      "SearchUsersForSettingSuccess"
    ) {
      return (searchUsersResult?.data?.searchUsersForProtectedBranchAccess
        ?.users ?? []) as Array<User>;
    }
    return [];
  }, [inputIsEmpty, searchUsersResult?.data]);

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
        }
      }
    },
    [userResults, selectedUser, users]
  );

  const onClickSelectedUser = useCallback(
    (user: User) => {
      setSelectedUser(user);
      const nextUsers = [...users.filter((u) => u.id != user.id), user];
      nextUsers.sort(
        (a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        }
      );
      setUsers(nextUsers);
      setUserInput("");
    },
    [users]
  );

  const onUpdate = useCallback(() => {
    if (!props?.repository?.id || !props?.repository?.protectedBranchRule?.id) {
      return;
    }
    const userIds = users?.map((u) => u.id as string) ?? [];
    updateUsers({
      variables: {
        repositoryId: props.repository.id,
        protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
        userIds
      }
    });

  }, [users, props.repository?.id, props?.repository?.protectedBranchRule?.id])

  useEffect(() => {
    if (updateUsersRequest?.data?.updateAnyoneCanRevertUsers?.__typename == "ProtectedBranchSettingChangeSuccess") {
      props?.onDismissModal();
    }
  }, [updateUsersRequest?.data?.updateAnyoneCanRevertUsers, props?.onDismissModal])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"revert access users"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <div style={{ position: "relative" }}>
            <Input
              ref={searchRef}
              value={userInput}
              label={"search members"}
              placeholder={"search members"}
              onTextChanged={onInputChange}
              widthSize="wide"
              onKeyDown={onKeyDown}
              tabIndex={0}
            />
            {!inputIsEmpty && (
              <SearchDropdownContainer>
                <FindUserSearchDropdown
                  users={userResults}
                  isLoading={searchUsersResult.loading}
                  onClickUser={onClickSelectedUser}
                  onHoverUser={onHoverSelectedUser}
                  selectedUser={selectedUser}
                />
              </SearchDropdownContainer>
            )}
          </div>
          <div style={{ width: 468, display: "block", textAlign: "left" }}>
            <InstructionsText>
              {
                "Search for members to enable revert access by @username, or first name and last name."
              }
            </InstructionsText>
          </div>
        </TopWrapper>
        <BottomWrapper>
          <UserContainer>
            <InnerContainer>
              {users.length == 0 && (
                <PlaceholderText>{"no users selected"}</PlaceholderText>
              )}

              {users.map((user, index) => {
                const fullname = formatFullname(
                  user.firstName ?? "",
                  user.lastName ?? ""
                );
                return (
                  <PillContainer key={index}>
                    <div style={{ marginRight: 8 }}>
                      <UserProfilePhoto
                        size={24}
                        user={user}
                        offlinePhoto={null}
                      />
                    </div>
                    <PillText>{fullname}</PillText>
                    <PillX
                      src={WhiteX}
                      onClick={() => {
                        const nextUsers = users.filter((u) => u.id != user.id);
                        setUsers(nextUsers);
                      }}
                    />
                  </PillContainer>
                );
              })}
            </InnerContainer>
            <UserLabelContainer>
              <UserLabelBorderEnd style={{ left: -1 }} />
                <UserLabelText>{"users who can revert changes"}</UserLabelText>
              <UserLabelBorderEnd style={{ right: -1 }} />
            </UserLabelContainer>
          </UserContainer>
          <div style={{ height: 40, marginBottom: 12, width: 470 }}>
          </div>
          <ButtonRow>
            <Button
              label={"cancel"}
              bg={"gray"}
              size={"medium"}
              onClick={props.onDismissModal}
            />
            <Button
              isLoading={updateUsersRequest.loading}
              label={"update"}
              bg={"purple"}
              size={"medium"}
              onClick={onUpdate}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(CanRevertUsersModal);
