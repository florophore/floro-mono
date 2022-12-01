import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import RootModal from '@floro/common-react/src/components/RootModal';
import Button from '@floro/storybook/stories/design-system/Button';
import Input from '@floro/storybook/stories/design-system/Input';
import WarningLabel from '@floro/storybook/stories/design-system/WarningLabel';
import { useSubmitEmailForAuthMutation } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import EmailValidator from 'email-validator';

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${props => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 5.5rem;
`;

const HeaderSubtitle = styled.h4`
  font-family: "MavenPro";
  color: ${props => props?.theme.colors.modalHeaderSubtitleColor};
  font-weight: 500;
  font-size: 2rem;
  margin-bottom: 12px;
`;

const EmailInstruction = styled.p`
  font-family: "MavenPro";
  color: ${props => props?.theme.colors.instructionTextColor};
  font-weight: 500;
  text-align: center;
  margin-bottom: 12px;
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

export interface Props {
    showEmailModal: boolean;
    onDismissModal: () => void;
    isSignIn: boolean;
}

const SignupLoginModal = (props: Props) => {
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const [submitEmail, { data, loading}] = useSubmitEmailForAuthMutation();
  const isValidEmail = useMemo(() => EmailValidator.validate(email), [email]);

  const subtitle = useMemo(() => {
    if (!isSent) {
      return props?.isSignIn ? 'sign in' : 'sign up';
    }
    return 'email sent!';
  }, [props.isSignIn, isSent]);

  const preSendInstruction = useMemo(() => {
    return props.isSignIn ? 'We will send you a link to sign in.' : 'We will send you a link to sign up.';
  }, [props.isSignIn]);

  const postSendInstruction = useMemo(() => {
    return props.isSignIn ? 'please click the link to login to your account.' : 'please click the link to complete sign up.';
  }, [props?.isSignIn]);

  const onSubmit = useCallback(() => {
    submitEmail({
      variables: {
        email,
        loginClient: 'desktop',
      },
    });
  }, [submitEmail, email]);

  const onKeyPressCB = useCallback((event: React.KeyboardEvent) => {
    if (event.code == 'Enter' && isValidEmail) {
        onSubmit?.();
    }
  }, [onSubmit, isValidEmail]);

  useEffect(() => {
    if (!props.showEmailModal) {
      setIsSent(false);
    }
  }, [props.showEmailModal]);

  useEffect(() => {
    if (data?.submitEmailForAuth?.type == 'VERIFICATION_SENT') {
      setIsSent(true);
      setEmail('');
    }
  }, [data?.submitEmailForAuth?.type]);

  return (
    <RootModal
      show={props.showEmailModal}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{'floro'}</FloroHeaderTitle>
          <HeaderSubtitle>{subtitle}</HeaderSubtitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        {!isSent &&
          <>
            <div>
              <EmailInstruction>
                {preSendInstruction}
              </EmailInstruction>
              <Input label="email" placeholder="email" value={email} onTextChanged={setEmail} type="email" onKeyDown={onKeyPressCB}/>
              <div style={{display: 'flex', height: 72, flexDirection: 'column', justifyContent: 'center'}}>
                {data?.submitEmailForAuth?.type == 'EMAIL_AUTH_ERROR' &&
                  <WarningLabel size={'small'} label='invalid email format, please try again.'/>
                }
              </div>
            </div>
            <Button size={'big'} bg={'purple'} label={'send email'} onClick={onSubmit} isLoading={loading} isDisabled={!isValidEmail} />
          </>
        }
        {isSent &&
          <>
            <div>
              <EmailInstruction>
                {"we've sent you an email with a link"}
              </EmailInstruction>
              <EmailInstruction>
                {postSendInstruction}
              </EmailInstruction>
            </div>
            <Button size={'big'} bg={'purple'} label={'close'} onClick={props?.onDismissModal} />
          </>
        }
      </ContentWrapper>
    </RootModal>
  );
};

export default React.memo(SignupLoginModal);