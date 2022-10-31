import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

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

const Home = (props: Props) => {
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
          {'User Home Page'}
        </Background>
      </motion.div>
    );
};

export default React.memo(Home);