import React from 'react'
import styled from '@emotion/styled';
import FloroIcon from '@floro/common-assets/assets/images/floro_logo.svg';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';


const BackgroundWrapper = styled.div`
  background-color: ${props => props.theme.background};
  display: flex;
  flex: 1;
  height: 100vh;
  min-height: 800px;
  width: 100%;
  min-width: 600px;
  align-items: space-between;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

const TopContainer = styled.div`
  width: 100%;
  height: 192px;
  background-color: ${props => props.theme.colors.heroHeaderBackgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const Title = styled.h1`
    font-family: "MavenPro";
    font-size: 3rem;
    font-weight: 600;
    margin: 0;
    padding: 0;
    color: ${props => props.theme.colors.heroHeaderTextColor};
`;

const BottomContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  background-color: ${props => props.theme.background};
`;

export interface Props {
  children?: React.ReactElement;
  title: string;
}


const HeroView = (props?: Props): React.ReactElement => {

  return (
    <BackgroundWrapper>
        <TopContainer>
            <Title>{props?.title}</Title>
        </TopContainer>
        <BottomContainer>
            {props?.children}
        </BottomContainer>
    </BackgroundWrapper>
  );
}

export default React.memo(HeroView);