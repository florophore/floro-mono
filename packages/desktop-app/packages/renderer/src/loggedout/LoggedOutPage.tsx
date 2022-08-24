import React, { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { css } from '@emotion/css';
import FloroLogoWithText from '../../assets/images/floro_logo_with_text.svg';
import BackButtonDark from '../../assets/images/icons/back_arrow.dark.svg';
import BackButtonLight from '../../assets/images/icons/back_arrow.light.svg';
import GoogleIcon from '../../assets/images/icons/google_icon.svg';
import GithubIcon from '../../assets/images/icons/github_white_bg.svg';
import Button from '@floro/storybook/stories/Button/index';
import GithubButton from '@floro/storybook/stories/GithubButton/index';
import GoogleButton from '@floro/storybook/stories/GoogleButton/index';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { useSystemAPI } from '../contexts/SystemAPIContext';

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
    min-height: 240px;
`;

const ButtonSpacer = styled.div`
  width: 64px;
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 240px;
    width: 100vw;
    max-width: 1600px;
    padding: 36px 0;
`;

const BackButton = styled.img`
  transition: opacity 400ms;
  left: 20%;
  top: 10%;
  position: absolute;
  height: 36px;
  width: 36px;
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
        setSearchParams(createSearchParams({pageAction: 'sign_up'}));
    }, [setSearchParams]);

    const onGoToSignInCB = useCallback(() => {
        setSearchParams(createSearchParams({pageAction: 'sign_in'}));
    }, [setSearchParams]);

    const onBackCallback = useCallback(() => {

        setSearchParams(createSearchParams({}));
    }, [setSearchParams]);

    const onOpenGithub = useCallback(async () => {
      systemAPI?.openOAuthWindow('github');
    }, [systemAPI]);

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
        animate={isOpen ? 'open' : 'closed'}
        transition={{duration: 0.5}}
        variants={variants}
      >
        <Background>
          <MainWrapper>
            <LogoImage src={FloroLogoWithText} draggable={false} />
            <AnimationWrapper>
              <motion.div
                animate={{left: actionLeftPosition}}
                className={css`
                  top: 0;
                  position: relative;
                  width: 300vw;
                  max-width: 4800px;
                  min-height: 240px;
                  display: flex;
                  flex-direction: row;
                `}
              >
                <ButtonWrapper>
                  <div className={css`
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    justify-content: center;
                    width: '100%;
                  `}>
                    <div className={css`
                      display: flex;
                      flex-direction: row;
                      flex: 1;
                      justify-content: center;
                    `}>
                      <GithubButton label={'Sign in with Github'} githubAsset={GithubIcon}/>
                      <ButtonSpacer/>
                      <GoogleButton label={'Sign in with Google'} googleAsset={GoogleIcon}/>
                    </div>
                    <div className={css`
                      margin-top: 36px;
                      display: flex;
                      flex-direction: row;
                      flex: 1;
                      justify-content: center;
                      align-items: center;
                    `}>
                      <Button label={'Sign in with email'} bg={'orange'}/>
                    </div>
                  </div>
                </ButtonWrapper>
                <ButtonWrapper>
                  <Button bg={'orange'} label={'Sign in'} onClick={onGoToSignInCB} />
                  <ButtonSpacer/>
                  <Button bg={'teal'} label={'Sign up'} onClick={onGoToSignUpCB} />
                </ButtonWrapper>
                <ButtonWrapper>
                  <div className={css`
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    justify-content: center;
                  `}>
                    <div className={css`
                      display: flex;
                      flex-direction: row;
                      flex: 1;
                      justify-content: center;
                    `}>
                      <GithubButton onClick={onOpenGithub} label={'Sign up with Github'} githubAsset={GithubIcon}/>
                      <ButtonSpacer/>
                      <GoogleButton label={'Sign up with Google'} googleAsset={GoogleIcon}/>
                    </div>
                    <div className={css`
                      margin-top: 36px;
                      display: flex;
                      flex-direction: row;
                      flex: 1;
                      justify-content: center;
                      align-items: center;
                    `}>
                      <Button label={'Sign up with email'} bg={'teal'}/>
                    </div>
                  </div>
                </ButtonWrapper>
              </motion.div>
            </AnimationWrapper>
            <BackButton
              onClick={onBackCallback}
              src={BackButtonIcon}
              draggable={false}
              style={{opacity: backButtonOpacity, cursor: backButtonCursor}}
            />
          </MainWrapper>
        </Background>
      </motion.div>
    );
};

export default React.memo(LoggedOutPage);