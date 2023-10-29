import React, {useEffect, useMemo, useCallback} from 'react';

import FloroLogo from '@floro/common-assets/assets/images/floro_logo.svg';
import styled from '@emotion/styled';
import {keyframes} from '@emotion/react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import colorPalette, {Opacity} from '@floro/styles/ColorPalette';
import {useSession} from '@floro/common-react/src/session/session-context';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';

const colorTransition = keyframes`
  from, 0% {
    background-color: ${colorPalette.lightPurple};
  }

  50% {
    background-color: ${colorPalette.darkPurple};
  }

  100% {
    background-color: ${colorPalette.lightPurple};
  }
`;

const purple100 = colorPalette.purple.substring(0, 7) + Opacity[100];
const purple0 = colorPalette.purple.substring(0, 7) + Opacity[0];

const ringTransition = keyframes`
  from, 0% {
    border: 0px solid ${purple100};
    width: 0vh;
    height: 0vh;
  }

  100% {
    border: 40px solid${purple0};
    width: 2000px;
    height: 2000px;
  }
`;

const Background = styled.div`
  animation: ${colorTransition} 4s ease infinite;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 300px;
  z-index: 1;
  cursor: pointer;
`;

const RingContainer = styled.div`
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Ring = styled.div`
  animation: ${ringTransition} 4s ease infinite;
  position: absolute;
  border-radius: 50%;
`;

const DragBar = styled.div`
  height: 60px;
  width: 100%;
  top: 0;
  position: absolute;
  -webkit-app-region: drag;
  cursor: drag;
`;

const quack = () => {
  const audio = new Audio('./assets/sounds/quack.mp3');
  audio.play();
};

const TRANSITION_TIME = 4000;

interface Props {
  isTransitionIn?: boolean;
  isOpen: boolean;
}

const LoadingPage = ({isTransitionIn = false}: Props) => {
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (e.code == 'Space') {
        quack();
      }
    };
    window.addEventListener('keypress', onKeyPress);

    return () => {
      window.removeEventListener('keypress', onKeyPress);
    };
  }, []);

  const onQuackCB = useCallback(quack, []);

  const {session} = useSession();
  useNavigationAnimator({
    dashboardView: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!session?.id) {
        navigate('/loggedout');
      } else {
        navigate('/home');
      }
    }, TRANSITION_TIME);

    return () => {
      clearTimeout(timeout);
    };
  }, [session?.id]);

  const initialPageAnim = useMemo(() => {
    if (isTransitionIn) {
      return {
        right: '-100%',
      };
    }
    return {
      right: 0,
    };
  }, [isTransitionIn]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
      }}
      initial={initialPageAnim}
      exit={{
        right: '100%',
      }}
      animate={{
        right: '0%',
      }}
      transition={{duration: 0.5}}
    >
      <Background>
        <RingContainer>
          <Ring style={{animationDelay: '0s'}} />
          <Ring style={{animationDelay: '0.25s'}} />
          <Ring style={{animationDelay: '0.5s'}} />
          <Ring style={{animationDelay: '0.75s'}} />
          <Ring style={{animationDelay: '1s'}} />
        </RingContainer>
        <Image draggable={false} src={FloroLogo} onClick={onQuackCB} />
      </Background>
      <DragBar />
    </motion.div>
  );
};

export default React.memo(LoadingPage);
