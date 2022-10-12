import React, { useState, useMemo, useEffect } from 'react';
import styled from '@emotion/styled';
import RootModal from '@floro/common-react/src/components/RootModal';
import Button from '@floro/storybook/stories/design-system/Button';
import Input from '@floro/storybook/stories/design-system/Input';

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

  const subtitle = useMemo(() => {
    if (!isSent) {
      return props?.isSignIn ? 'sign in' : 'sign up';
    }
    return 'email sent!';
  }, [props.isSignIn, isSent]);

  useEffect(() => {
    if (!props.showEmailModal) {
      setIsSent(false);
    }
  }, [props.showEmailModal]);

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
        <div>
          <EmailInstruction>
            {props.isSignIn
              ? 'We will send you a link to sign in.'
              : 'We will send you a link to sign up.'}
          </EmailInstruction>
          <Input label="email" placeholder="email" value={email} onTextChanged={setEmail} type="email"/>
        </div>
        <Button size={'big'} bg={'purple'} label={'send email'} />
      </ContentWrapper>
    </RootModal>
  );
};

export default React.memo(SignupLoginModal);