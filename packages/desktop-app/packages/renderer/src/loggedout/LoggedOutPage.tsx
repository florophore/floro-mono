import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { css } from '@emotion/css';
import FloroLogoWithText from '@floro/common-assets/assets/images/floro_logo_with_text.svg';
import BackButtonDark from '@floro/common-assets/assets/images/icons/back_arrow.dark.svg';
import BackButtonLight from '@floro/common-assets/assets/images/icons/back_arrow.light.svg';
import Button from '@floro/storybook/stories/design-system/Button/index';
import GithubButton from '@floro/storybook/stories/design-system/GithubButton/index';
import GoogleButton from '@floro/storybook/stories/design-system/GoogleButton/index';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { useSystemAPI } from '../contexts/SystemAPIContext';
import mixpanel from 'mixpanel-browser';
import SignupLoginModal from './SignupLoginModal';
import { useSocketEvent } from '@floro/common-react/src/pubsub/socket';
import type { CompleteSignupAction, PassedLoginAction } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { setClientSession } from '@floro/common-react/src/session/client-session';

const Background = styled.div`
  background-color: ${props => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const MainWrapper = styled.div`
  display: flex;
  height: 100%;
  min-height: 675px;
  max-height: 900px;
  width: 100%;
  max-width: 1600px;
  min-width: 900px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
`;

const LogoImage = styled.img`
  width: 300px;
`;

const AnimationWrapper = styled.div`
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  min-height: 272px;
`;

const ButtonSpacer = styled.div`
  width: 128px;
`;

const PaneWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: space-between;
  min-height: 272px;
  width: 100vw;
  max-width: 1600px;
  padding: 64px 0 24px 0;
`;

const BackButton = styled.img`
  transition: opacity 400ms;
  left: 0px;
  top: 0px;
  position: absolute;
  height: 36px;
  width: 36px;
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  width: '100%;
`;

const PaneRow = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;
`;

const PaneBottomButtonWrapper = styled.div`
  margin-top: 36px;
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const DragBar = styled.div`
  height: 60px;
  width: 100%;
  top: 0;
  position: absolute;
  -webkit-app-region: drag;
  cursor: drag;
`;

interface Props {
    isOpen: boolean;
}

const variants = {
    open: {
        right: 0,
    },
    closed: {
        right: '-100%',
    },
};

const LoggedOutPage = ({isOpen}: Props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageAction = searchParams.get('pageAction');
    const themeName = useTheme().name;
    const systemAPI = useSystemAPI();
    const navigate = useNavigate();
    const [showEmailModal, setShowEmailModal] = useState(false);

    useSocketEvent<CompleteSignupAction>('complete_signup', (payload) => {
      navigate('/complete_signup', { state: payload});
    }, [navigate]);

    useSocketEvent<PassedLoginAction>('login', (payload) => {
      setClientSession(payload);
      navigate('/home');
    }, [navigate]);

    const BackButtonIcon = useMemo(() => {
        if (themeName == 'light') {
            return BackButtonLight;
        }
        return BackButtonDark;
    }, [themeName]);

    const showBackButton = useMemo(() => pageAction == 'sign_up' || pageAction == 'sign_in', [pageAction]);
    const backButtonOpacity = useMemo(() => showBackButton ? 1 : 0, [showBackButton]);
    const backButtonCursor = useMemo(() => showBackButton ? 'pointer' : 'default', [showBackButton]);

    const onGoToSignUpCB = useCallback(() => {
        mixpanel.track('Go to Sign up page');
        setSearchParams(createSearchParams({pageAction: 'sign_up'}));
    }, [setSearchParams]);

    const onGoToSignInCB = useCallback(() => {
        mixpanel.track('Go to Sign in page');
        setSearchParams(createSearchParams({pageAction: 'sign_in'}));
    }, [setSearchParams]);

    const onBackCallback = useCallback(() => {
        mixpanel.track('Go to back to logged out page page', {
          pageAction,
        });
        setSearchParams(createSearchParams({}));
    }, [setSearchParams, pageAction]);

    const onOpenGithub = useCallback(async () => {
        mixpanel.track('OAuth with Github');
      systemAPI?.openOAuthWindow('github');
    }, [systemAPI]);

    const onOpenGoogle = useCallback(async () => {
      mixpanel.track('OAuth with Google');
      systemAPI?.openOAuthWindow('google');
    }, [systemAPI]);

    const onOpenEmailSignup = useCallback(async () => {
      mixpanel.track('Sign up with email');
      setShowEmailModal(true);
    }, []);

    const onOpenEmailLogin = useCallback(async () => {
      mixpanel.track('Login with email');
      setShowEmailModal(true);
    }, []);

    const onDismissModal = useCallback(async () => {
      mixpanel.track('Close signup/login modal');
      setShowEmailModal(false);
    }, []);

    const actionLeftPosition = useMemo(() => {
        if (pageAction == 'sign_up') {
            return '-200%';

        }
        if (pageAction == 'sign_in') {
            return '0%';
        }
        return '-100%';
    }, [pageAction]);

    return (
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
        }}
        initial={{
          right: '-100%',
        }} 
        exit={{
          right: '100%',
        }}
        animate={isOpen ? 'open' : 'closed'}
        transition={{duration: 0.5}}
        variants={variants}
      >
        <SignupLoginModal
          showEmailModal={showEmailModal}
          onDismissModal={onDismissModal}
          isSignIn={pageAction === 'sign_in'}
        />
        <Background>
          <MainWrapper>
            <div
              className={css`
                position: relative;
                width: 100%;
                max-width: 760px;
                display: flex;
                justify-content: center;
              `}
            >
              <LogoImage src={FloroLogoWithText} draggable={false} />
              <BackButton
                onClick={onBackCallback}
                src={BackButtonIcon}
                draggable={false}
                style={{opacity: backButtonOpacity, cursor: backButtonCursor}}
              />
            </div>
            <AnimationWrapper>
              <motion.div
                animate={{left: actionLeftPosition}}
                className={css`
                  top: 0;
                  position: relative;
                  width: 300vw;
                  max-width: 4800px;
                  min-height: 272px;
                  display: flex;
                  flex-direction: row;
                `}
              >
                <PaneWrapper>
                  <Pane>
                    <PaneRow>
                      <GithubButton onClick={onOpenGithub} label={'Sign in with Github'} />
                      <ButtonSpacer />
                      <GoogleButton onClick={onOpenGoogle} label={'Sign in with Google'} />
                    </PaneRow>
                    <PaneBottomButtonWrapper>
                      <Button
                        size={'big'}
                        onClick={onOpenEmailLogin}
                        label={'Sign in with email'}
                        bg={'orange'}
                      />
                    </PaneBottomButtonWrapper>
                  </Pane>
                </PaneWrapper>
                <PaneWrapper>
                  <Button size={'big'} bg={'orange'} label={'Sign in'} onClick={onGoToSignInCB} />
                  <ButtonSpacer />
                  <Button size={'big'} bg={'teal'} label={'Sign up'} onClick={onGoToSignUpCB} />
                </PaneWrapper>
                <PaneWrapper>
                  <Pane>
                    <PaneRow>
                      <GithubButton onClick={onOpenGithub} label={'Sign up with Github'} />
                      <ButtonSpacer />
                      <GoogleButton onClick={onOpenGoogle} label={'Sign up with Google'} />
                    </PaneRow>
                    <PaneBottomButtonWrapper>
                      <Button
                        size={'big'}
                        onClick={onOpenEmailSignup}
                        label={'Sign up with email'}
                        bg={'teal'}
                      />
                    </PaneBottomButtonWrapper>
                  </Pane>
                </PaneWrapper>
              </motion.div>
            </AnimationWrapper>
          </MainWrapper>
        </Background>
        <DragBar/>
      </motion.div>
    );
};

export default React.memo(LoggedOutPage);