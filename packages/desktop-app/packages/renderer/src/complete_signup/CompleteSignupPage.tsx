import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AccountCreationSuccessAction, CompleteSignupAction, PassedLoginAction } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import SignupContainer from '@floro/common-react/src/components/signup/SignupContainer';
import { useSocketEvent } from '@floro/common-react/src/pubsub/socket';
import axios from 'axios';
import { useMutation } from 'react-query';
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
const DragBar = styled.div`
  height: 60px;
  width: 100%;
  top: 0;
  position: absolute;
  -webkit-app-region: drag;
  cursor: drag;
`;

const variants = {
    open: {
        right: 0,
    },
    closed: {
        right: '-100%',
    },
};

export interface Props {
    isOpen: boolean;
}

const CompleteSignupPage = (props: Props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const completeSignupAction = useMemo(() => location?.state as CompleteSignupAction, [location?.state]);
    const onGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useSocketEvent<PassedLoginAction>('login', (payload) => {
      setClientSession(payload);
      navigate('/home');
    }, [navigate]);

    const loginMutation = useMutation(
      async (loginInfo: PassedLoginAction | AccountCreationSuccessAction) => {
        try {
          await axios.post('http://localhost:63403/login', loginInfo);
          return true;
        } catch (e) {
          return false;
        }
      },
    );

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
        animate={props.isOpen ? 'open' : 'closed'}
        transition={{duration: 0.5}}
        variants={variants}
      >
        <Background>
            <SignupContainer completeSignupAction={completeSignupAction} showCancel onCancel={onGoBack} onPassedLogin={loginMutation.mutate}/>
        </Background>
        <DragBar/>
      </motion.div>
    );
};

export default React.memo(CompleteSignupPage);