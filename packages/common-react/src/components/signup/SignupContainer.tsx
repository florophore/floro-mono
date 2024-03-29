import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AccountCreationSuccessAction, CompleteSignupAction, useCreateAccountMutation, useUsernameCheckLazyQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import SignupInputs from '@floro/storybook/stories/common-components/SignupInputs';
import HeroView from '@floro/storybook/stories/common-components/HeroView';
import Button from '@floro/storybook/stories/design-system/Button';
import styled from '@emotion/styled';
import { NAME_REGEX, USERNAME_REGEX } from '@floro/common-web/src/utils/validators';
import Filter from 'bad-words';
import debouncer from 'lodash.debounce';
import { useOpenLink } from '../../links/OpenLinkContext';

const BackgroundWrapper = styled.div`
  display: flex;
  flex: 1;
  align-self: center;
  align-items: center;
  flex-direction: column;
  padding: 0 32px;
`;

const Container = styled.div`
  background-color: ${props => props.theme.background};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: -128px;
`;

const ButtonContainer = styled.div`
  margin-top: 32px;
  padding: 0 40px;
  max-width: 960px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;
const BottomButtonContainer = styled.div`
  margin-top: 32px;
  padding: 0 40px;
  max-width: 960px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export interface Props {
    completeSignupAction: CompleteSignupAction;
    showCancel?: boolean;
    onCancel?: () => void;
    onPassedLogin?: (loginInfo: AccountCreationSuccessAction) => void;
}

const SignupContainer = (props: Props) => {
  const openLink = useOpenLink();
  const profanityFilter = useMemo(() => new Filter(), []);
  const [firstName, setFirstName] = useState(
    props?.completeSignupAction?.unsavedUser?.firstName ?? ""
  );
  const [lastName, setLastName] = useState(
    props?.completeSignupAction?.unsavedUser?.lastName ?? ""
  );
  const [username, setUsername] = useState(
    props?.completeSignupAction?.unsavedUser?.username ?? ""
  );
  const [agreeToTOS, setAgreeToTOS] = useState(false);

  const [createAccount, createAccountRequest]= useCreateAccountMutation();

  const [checkUserName, { data, loading }] = useUsernameCheckLazyQuery({
    nextFetchPolicy: "network-only"
  });

  const checkUsernameDebounced = useCallback(debouncer(checkUserName, 300), [checkUserName]);

  useEffect(() => {
    checkUsernameDebounced({
      variables: {
        username
      }
    })
  }, [username]);

  const isValid = useMemo(() => {
    return (
      agreeToTOS &&
      USERNAME_REGEX.test(username) &&
      data?.usernameCheck?.username == username &&
      NAME_REGEX.test(firstName) &&
      NAME_REGEX.test(lastName) &&
      !profanityFilter.isProfane(username) &&
      !profanityFilter.isProfane(firstName) &&
      !profanityFilter.isProfane(lastName)
    );
  }, [
    agreeToTOS,
    username,
    data?.usernameCheck,
    firstName,
    lastName,
    profanityFilter,
  ]);

  const onSubmit = useCallback(() => {
    createAccount({
      variables: {
        agreeToTOS,
        firstName,
        lastName,
        username,
        exchangeKey: props?.completeSignupAction.exchangeKey as string,
        credentialId: props?.completeSignupAction.authId as string,
      },
    });
  }, [
    agreeToTOS,
    firstName,
    lastName,
    username,
    isValid,
    props.completeSignupAction?.exchangeKey,
    props.completeSignupAction?.authId,
    createAccount,
  ]);

  const onShowTOS = useCallback(() => {
    openLink("https://floro.io/tos")
  }, []);

  useEffect(() => {
    if (createAccountRequest?.data?.createAccount?.type == "ACCOUNT_CREATION_SUCCESS") {
      props?.onPassedLogin?.(createAccountRequest?.data?.createAccount.action as AccountCreationSuccessAction);
    }
  }, [createAccountRequest?.data, props?.onPassedLogin])

  return (
    <HeroView title={"create an account"}>
      <BackgroundWrapper>
        <Container>
          <SignupInputs
            firstName={firstName}
            lastName={lastName}
            username={username}
            onUpdateFirstName={setFirstName}
            onUpdateLastName={setLastName}
            onUpdateUsername={setUsername}
            agreedToTOS={agreeToTOS}
            onUpdateAgreedToTOS={setAgreeToTOS}
            onOpenTOS={onShowTOS}
            usernameCheckLoading={loading}
            usernameIsTaken={data?.usernameCheck?.exists ?? false}
          />
          {!props?.showCancel && (
            <ButtonContainer>
              <Button
                size={"medium"}
                label="confirm"
                isDisabled={!isValid}
                bg={"purple"}
                isLoading={createAccountRequest.loading}
                onClick={onSubmit}
              />
            </ButtonContainer>
          )}
        </Container>
        {props?.showCancel && (
          <BottomButtonContainer>
            <Button
              size={"medium"}
              label="cancel"
              isDisabled={createAccountRequest.loading}
              bg={"gray"}
              onClick={props?.onCancel}
            />
            <Button
              size={"medium"}
              label="confirm"
              isDisabled={!isValid}
              bg={"purple"}
              isLoading={createAccountRequest.loading || loading}
              onClick={onSubmit}
            />
          </BottomButtonContainer>
        )}
      </BackgroundWrapper>
    </HeroView>
  );
};

export default React.memo(SignupContainer);