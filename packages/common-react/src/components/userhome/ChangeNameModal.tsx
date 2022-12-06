import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootModal from "@floro/common-react/src/components/RootModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useSession } from "../../session/session-context";
import { NAME_REGEX } from "@floro/common-web/src/utils/validators";
import { User, useUpdateUserNameMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useIsOnline } from "../../hooks/offline";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const HeaderSubtitle = styled.h4`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderSubtitleColor};
  font-weight: 500;
  font-size: 2.4rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

export interface Props {
  show: boolean;
  onDismissModal: () => void;
}

const ChangeNameModal = (props: Props) => {
  const { currentUser, setCurrentUser } = useSession();
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const isOnline = useIsOnline();

  const [updateName, { data, error, loading}] = useUpdateUserNameMutation();

  const firstNameIsValid = useMemo(() => {
    return NAME_REGEX.test(firstName);
  }, [firstName]);

  const lastNameIsValid = useMemo(() => {
    return NAME_REGEX.test(lastName);
  }, [lastName]);

  const isValid = useMemo(() => {
    return firstNameIsValid && lastNameIsValid && isOnline;
  }, [firstNameIsValid, lastNameIsValid, isOnline]);

  const onClickUpdateName = useCallback(() => {
    if (isValid) {
      updateName({
        variables: {
          firstName,
          lastName
        }
      })
    }

  }, [updateName, isValid, firstName, lastName]); 

  useEffect(() => {
    if (data?.updateUserName?.__typename == "UpdateUserNameSuccess") {
      //setCurrentUser(data?.updateUserName?.user as User);
      setFirstName(data?.updateUserName?.user?.firstName ?? firstName);
      setLastName(data?.updateUserName?.user?.lastName ?? lastName);
      props.onDismissModal();
    }
  }, [data, error, setCurrentUser, props.onDismissModal]);

  useEffect(() => {
    if (!props.show) {
      setFirstName(currentUser?.firstName ?? firstName);
      setLastName(currentUser?.lastName ?? lastName);
    }
  }, [props.show, currentUser])

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerChildren={
        <HeaderWrapper>
          <HeaderSubtitle>{"update name"}</HeaderSubtitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <div>
          <div style={{ marginBottom: 36 }}>
            <Input
              label={"first name"}
              value={firstName}
              placeholder={"first name"}
              onTextChanged={setFirstName}
              isValid={firstNameIsValid}
            />
          </div>
          <div style={{ marginBottom: 36 }}>
            <Input
              label={"last name"}
              value={lastName}
              placeholder={"last name"}
              onTextChanged={setLastName}
              isValid={lastNameIsValid}
            />
          </div>
        </div>
        <Button
          size={"big"}
          bg={"purple"}
          label={"change name"}
          isLoading={loading}
          isDisabled={!isValid}
          onClick={onClickUpdateName}
        />
      </ContentWrapper>
    </RootModal>
  );
};

export default React.memo(ChangeNameModal);
