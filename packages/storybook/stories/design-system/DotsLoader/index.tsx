import React, { useMemo } from 'react';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import colorPalette, { ColorPalette } from '@floro/styles/ColorPalette';

export interface DotLoaderProps {
    color: keyof ColorPalette;
    size: "small" | "medium" | "large";
}

const Wrapper = styled.div`
    white-space: nowrap;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const fadingKeyframeTransition = keyframes`
  from, 0% {
    opacity: 0.2;
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
`;

const LoadingDots = styled.span`
  animation-name: ${fadingKeyframeTransition};
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const CircleSmall = styled.span`
  display: inline-block;
  vertical-align: middle;
  height: 0.5rem;
  width: 0.5rem;
  margin: 0 0.2rem;
  border-radius: 50%;
`;

const CircleMedium = styled.span`
  display: inline-block;
  vertical-align: middle;
  height: 0.75rem;
  width: 0.75rem;
  margin: 0 0.3rem;
  border-radius: 50%;
`;

const CircleLarge = styled.span`
  display: inline-block;
  vertical-align: middle;
  height: 1rem;
  width: 1rem;
  margin: 0 0.4rem;
  border-radius: 50%;
`;

const Circles = {
    small: CircleSmall,
    medium: CircleMedium,
    large: CircleLarge,
};

const DotsLoader = (props: DotLoaderProps) => {
    const Circle = useMemo(() => Circles[props?.size], [props?.size]);
    const backgroundColor = useMemo(() => colorPalette[props?.color ?? 'white'], [props.color]);
    return (
        <Wrapper>
            <LoadingDots>
                <Circle style={{backgroundColor}} />
            </LoadingDots>
            <LoadingDots style={{animationDelay: '0.2s',}}>
                <Circle style={{backgroundColor}}/>
            </LoadingDots>
            <LoadingDots style={{animationDelay: '0.4s',}}>
                <Circle style={{backgroundColor}}/>
            </LoadingDots>
        </Wrapper>
    );
};

export default React.memo(DotsLoader);