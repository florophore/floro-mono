import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import FloroLogoWithText from '../../assets/images/floro_logo_with_text.svg';

const Background = styled.div`
    background-color: white;
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
`;

const LogoImage = styled.img`
    width: 300px;
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
                </MainWrapper>
            </Background>
        </motion.div>
    );
};

export default React.memo(LoggedOutPage);