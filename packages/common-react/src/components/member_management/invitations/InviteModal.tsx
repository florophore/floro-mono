import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import {
  Organization,
  User,
  useSearchUsersToInviteLazyQuery,
  useCreateOrganizationInvitationMutation
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import debouncer from 'lodash.debounce';
import EmailValidator from 'email-validator';
import FindUserSearchDropdown from "./FindUserSearchDropdown";
import UserDescriptor from "./UserDescriptor";

import RedXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import VerifyLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifyDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";

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
  color: ${props => props.theme.colors.titleText};
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
const RoleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 2px;
`;

const RoleText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const WarningIcon = styled.img`
  height: 128px;
  width: 128px;
`;

const VerifyIcon = styled.img`
  height: 128px;
  width: 128px;
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.promptText};
`;

const SentText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.titleText};
`;

const InstructionsText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => ColorPalette.gray};
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};


export interface Props {
  show: boolean;
  onDismissModal: () => void;
  organization: Organization;
  currentInvitationId?: string|null;
  currentInvitationQuery?: string|null;
}

const InviteModal = (props: Props) => {
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [inviteUser, setInviteUser] = useState<User|null>(null);
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set([]));

  const [selectedUser, setSelectedUser] = useState<User|undefined>(undefined);

  const [createInvitation, createInvitationResponse] = useCreateOrganizationInvitationMutation();

  const verifyIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifyLight;
    }
    return VerifyDark;
  }, [theme.name])

  const errorIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXLight;
    }
    return RedXDark;
  }, [theme.name])

  const onHideError = useCallback(() => {
    setShowError(false);
    createInvitationResponse.reset();
  }, []);

  const defaultRoleIds = useMemo(() => {
    return props?.organization?.roles
      ?.filter((r) => r?.isDefault)
      ?.map((r) => r?.id as string);
  }, [props?.organization?.roles]);

  useEffect(() => {
    if (props.show) {
        setUserInput("");
        setAssignedRoles(new Set(defaultRoleIds));
        setIsFocused(false);
        setFirstName("");
        setLastName("");
        setInviteUser(null);
        setSelectedUser(undefined);
        setShowError(false);
        setShowSuccess(false);

      if (searchRef.current) {
        searchRef.current.focus?.();
      }
    } else {
        setUserInput("");
        setAssignedRoles(new Set(defaultRoleIds));
        setIsFocused(false);
        setFirstName("");
        setLastName("");
        setInviteUser(null);
        setSelectedUser(undefined);
        setShowError(false);
        setShowSuccess(false);
        createInvitationResponse.reset();
    }
  }, [props.show, defaultRoleIds]);


  const onHoverSelectedUser = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  }, []);

  const [searchUsers, searchUsersResult] = useSearchUsersToInviteLazyQuery({
    fetchPolicy: "no-cache"
  });

  const inputIsEmpty =  useMemo(() => userInput.trim() == "", [userInput]);
  const isEmail =  useMemo(() => !inputIsEmpty && EmailValidator.validate(userInput), [userInput, inputIsEmpty]);

  const searchUsersDebounced = useCallback(debouncer(searchUsers, 300), [
    searchUsers,
  ]);

  const onInputChange = useCallback((text: string) => {
    setUserInput(text);
  }, []);

  useEffect(() => {
    if (!props.organization?.id || inputIsEmpty) {
      return;
    }
    if (isEmail) {
      return;
    }

    searchUsersDebounced({
      variables: {
        organizationId: props.organization.id,
        query: userInput,
      },
    });
  }, [
    isEmail,
    inputIsEmpty,
    searchUsersDebounced,
    props.organization?.id,
    userInput,
  ]);

  const userResults = useMemo((): Array<User> => {
    if (isEmail || inputIsEmpty) {
        return [];
    }
    if (searchUsersResult?.data?.searchUsersToInvite?.__typename == "InviteSearchResultSuccess") {
        return (searchUsersResult?.data?.searchUsersToInvite?.users ?? []) as Array<User>;
    }
    return [];
  }, [isEmail, inputIsEmpty, searchUsersResult?.data])

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (userResults.length == 0) {
      return;
    }
    if (event.code == "ArrowDown") {
      event.preventDefault();
      if (!selectedUser || !userResults.map(u => u.id).includes(selectedUser?.id as string)) {
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
      if (!selectedUser || !userResults.map(u => u.id).includes(selectedUser?.id as string)) {
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
        setInviteUser(selectedUser);
      }
    }
  }, [userResults, selectedUser]);

  const firstNameIsValid = useMemo(() => {
    return firstName.length >= 2;
  }, [firstName]);

  const canSend = useMemo(() => {
    if (inviteUser) {
      return true;
    }
    if (isEmail) {
      return firstNameIsValid;
    }
    return false;
  }, [isEmail, firstNameIsValid, inviteUser]);

  const onSendInvite = useCallback(() => {
    if (!props.organization?.id) {
      return;
    }
    if (isEmail) {
      createInvitation({
        variables: {
          organizationId: props.organization?.id,
          email: userInput,
          firstName,
          lastName,
          roleIds: Array.from(assignedRoles),
          currentInvitationId: props.currentInvitationId,
          currentInvitationQuery: props.currentInvitationQuery,
        },
      });
      return;
    }
    if (!inviteUser) {
      return;
    }
    createInvitation({
      variables: {
        organizationId: props.organization?.id,
        userId: inviteUser.id,
        roleIds: Array.from(assignedRoles),
        currentInvitationId: props.currentInvitationId,
        currentInvitationQuery: props.currentInvitationQuery,
      },
    });
  }, [
    canSend,
    props.organization,
    inviteUser,
    isEmail,
    userInput,
    firstName,
    lastName,
    assignedRoles,
    props.currentInvitationId,
    props.currentInvitationQuery,
  ]);

  useEffect(() => {
    if (
      createInvitationResponse?.data?.createInvitation?.__typename ==
      "CreateOrganizationInvitationSuccess"
    ) {
      setShowSuccess(true);
      return;
    }
    if (
      createInvitationResponse?.data?.createInvitation?.__typename ==
        "CreateOrganizationInvitationError" ||
      createInvitationResponse?.data?.createInvitation?.__typename ==
        "UnAuthenticatedError"
    ) {
      setShowError(true);
      return;
    }
  }, [createInvitationResponse]);

  const userFirstName = useMemo(() => upcaseFirst(inviteUser?.firstName ?? ""), [inviteUser?.firstName]);
  const userLastName = useMemo(() => upcaseFirst(inviteUser?.lastName ?? ""), [inviteUser?.lastName]);

  const userFullname = useMemo(() => {
    return `${userFirstName} ${userLastName}`;
  }, [userFirstName, userLastName]);

  const onClickSelectedUser = useCallback((user: User) => {
    setSelectedUser(user);
    setInviteUser(user);
  }, []);

  const onRemoveInvitedUser = useCallback(() => {
    setInviteUser(null);
    setUserInput("");
  }, []);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"invite new member"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        {showError && (
          <TopWrapper
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <WarningIcon src={errorIcon} />
            <SentText>{"Something went wrong!"}</SentText>
          </TopWrapper>
        )}
        {showSuccess && (
          <TopWrapper
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <VerifyIcon src={verifyIcon} />
            <PromptText>{"Invitation sent to"}</PromptText>
            {isEmail && <SentText>{userInput}</SentText>}
            {!isEmail && <SentText>{userFullname}</SentText>}
          </TopWrapper>
        )}
        {!showError && !showSuccess && (
          <TopWrapper>
            {!inviteUser && (
              <div style={{ position: "relative" }}>
                <Input
                  ref={searchRef}
                  value={userInput}
                  label={isEmail ? "email" : "search user/enter email"}
                  placeholder={"search user or invite by email"}
                  onTextChanged={onInputChange}
                  widthSize="wide"
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onKeyDown={onKeyDown}
                  tabIndex={0}
                />
                {!inputIsEmpty && isFocused && !isEmail && (
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
            )}
            {!inviteUser && !isEmail && (
              <div style={{width: 468, display: 'block', textAlign: 'left'}}>
                <InstructionsText>
                  {
                    "Search for members to invite by @username, first name and last name or enter their email address if you do not know if they are signed up with floro."
                  }
                </InstructionsText>
              </div>
            )}
            {inviteUser && (
              <UserDescriptor
                label={"invite user"}
                user={inviteUser}
                onRemove={onRemoveInvitedUser}
              />
            )}
            {isEmail && (
              <>
                <div style={{ marginTop: 24 }}>
                  <Input
                    value={firstName}
                    label={"first name"}
                    placeholder={"first name (required)"}
                    onTextChanged={setFirstName}
                    widthSize={"wide"}
                    isValid={firstNameIsValid}
                  />
                </div>
                <div style={{ marginTop: 24 }}>
                  <Input
                    value={lastName}
                    label={"last name"}
                    placeholder={"last name (optional)"}
                    onTextChanged={setLastName}
                    widthSize={"wide"}
                  />
                </div>
              </>
            )}
            {(inviteUser || isEmail) && props.organization?.membership?.permissions?.canAssignRoles && (
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "flex-start",
                  width: 468,
                  flexDirection: "column",
                }}
              >
                <LabelText>{"Assign Roles"}</LabelText>
                <div style={{ marginTop: 20 }}>
                  {props?.organization?.roles?.map((role, index) => {
                    return (
                      <RoleRow key={index}>
                        <Checkbox
                          isChecked={assignedRoles.has(role?.id as string)}
                          onChange={() => {
                            if (assignedRoles.has(role?.id as string)) {
                              assignedRoles.delete(role?.id as string);
                              setAssignedRoles(
                                new Set(Array.from(assignedRoles))
                              );
                            } else {
                              assignedRoles.add(role?.id as string);
                              setAssignedRoles(
                                new Set(Array.from(assignedRoles))
                              );
                            }
                          }}
                        />
                        <RoleText>{role?.name}</RoleText>
                      </RoleRow>
                    );
                  })}
                </div>
              </div>
            )}
          </TopWrapper>
        )}
        <BottomWrapper>
          {showSuccess && (
            <ButtonRow>
              <Button
                onClick={props.onDismissModal}
                label={"close"}
                bg={"purple"}
                size={"extra-big"}
              />
            </ButtonRow>
          )}
          {showError && (
            <ButtonRow>
              <Button
                onClick={onHideError}
                label={"back to invite"}
                bg={"purple"}
                size={"medium"}
              />
              <Button
                onClick={props.onDismissModal}
                label={"close"}
                bg={"gray"}
                size={"medium"}
              />
            </ButtonRow>
          )}
          {!showError && !showSuccess && (
            <ButtonRow>
              <Button
                isLoading={createInvitationResponse.loading}
                isDisabled={!canSend}
                onClick={onSendInvite}
                label={"send invitation"}
                bg={"purple"}
                size={"extra-big"}
              />
            </ButtonRow>
          )}
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(InviteModal);