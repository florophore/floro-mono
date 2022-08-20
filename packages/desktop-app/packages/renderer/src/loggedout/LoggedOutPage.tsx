import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { css } from '@emotion/css';
import FloroLogoWithText from '../../assets/images/floro_logo_with_text.svg';
import BackButtonDark from '../../assets/images/icons/back_arrow.dark.svg';
import BackButtonLight from '../../assets/images/icons/back_arrow.light.svg';
import Button from '@floro/storybook/stories/Button/index';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

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
                <ButtonWrapper style={{background: 'blue'}}></ButtonWrapper>
                <ButtonWrapper style={{}}>
                  <Button bg={'orange'} label={'sign in'} onClick={onGoToSignInCB} />
                  <div style={{width: 64}} />
                  <Button bg={'teal'} label={'sign up'} onClick={onGoToSignUpCB} />
                </ButtonWrapper>
                <ButtonWrapper style={{background: 'green'}}></ButtonWrapper>
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